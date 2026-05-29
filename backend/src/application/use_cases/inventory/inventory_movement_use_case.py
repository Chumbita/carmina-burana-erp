# app/inventory/application/service.py
from decimal import Decimal

# Interfaces
from src.domain.repositories.inventory_balance_repository import IInventoryBalanceRepository
from src.domain.repositories.inventory_transaction_repository import IInventoryTransactionRepository
from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository

# Entidades
from src.domain.entities.inventory_balance import InventoryBalance
from src.domain.entities.inventory_transaction import InventoryTransaction
from src.domain.entities.inventory_lot import InventoryLot

# Servicios de dominio
from src.domain.services.inventory_movement_service import InventoryDomainService

# Value objects
from src.domain.value_objects.inventory_transaction_enums import SIGN_PRESERVED_TYPES

# Excepciones
from src.domain.exceptions.inventory_exceptions import DuplicateLotCodeError, LotNotFoundError

# DTOs
from src.application.dtos.inventory_movement_dtos import InventoryMovementCommand


class InventoryMovementUseCase:
    """
    Caso de uso: aplicar un movimiento de inventario.

    RESPONSABILIDAD: orquestar el flujo completo de un movimiento de
    inventario como una unidad de trabajo coherente, coordinando las
    entidades de dominio, el servicio de dominio y los repositorios.

    FLUJO COMPLETO:
    1. Resolver lot_id
        - Si es una operación que implica crear un lote:
            -> Validar unicidad.
            -> Crear entidad.
            -> Persistir.
            -> Obtener ID del nuevo lote creado.
        - Si es una operación que trabaja sobre un lote existente:
            -> Verificar la existencia del mismo.
            -> Obtener ID.
    
    2. Calcular signed_quantity -> Se encarga el servicio de dominio.
    3. Registrar transacción.
    4. Crear o actualizar balance.
        - Sin balance previo:
            -> Crear balance.
        - Con balance existente:
            -> Aplicar delta en la cantidad.
            -> Persistir cambios.

    IMPORTANTE:
    Este caso de uso no hace commit ni rollback. El caller (endpoint
    o servicio de otro módulo) es dueño de la sesión y decide cuándo
    commitear. Esto permite que el movimiento de inventario sea parte
    de una transacción de negocio más amplia (ej: crear la orden de
    compra + mover inventario en un único commit atómico).
    """

    def __init__(
        self,
        lot_repository: IInventoryLotRepository,
        balance_repository: IInventoryBalanceRepository,
        transaction_repository: IInventoryTransactionRepository,
        domain_service: InventoryDomainService,
    ) -> None:
        self._lot_repository = lot_repository
        self._balance_repository = balance_repository
        self._transaction_repository = transaction_repository
        self._domain_service = domain_service


    # --- Método principal ----------------------------------------------------------------
    async def execute(self, command: InventoryMovementCommand) -> None:
        """
        Punto de entrada único del caso de uso.
        """
        lot_id = await self._resolve_lot(command)

        signed_quantity = self._domain_service.compute_signed_quantity(
            command.transaction_type,
            command.quantity,
        )

        await self._record_transaction(command, lot_id, signed_quantity)

        await self._apply_balance(
            item_id=command.item_id,
            lot_id=lot_id,
            signed_quantity=signed_quantity,
            transaction_type_is_adjustment=command.transaction_type in SIGN_PRESERVED_TYPES,
        )


    # --- Utilidades para el flujo principal -----------------------------------------------

    async def _resolve_lot(self, command: InventoryMovementCommand) -> int:
        """
        Determina el lot_id definitivo para el movimiento.

        Determina si hay que crear un lote o verificar que uno existente
        esté disponible.
        """
        if self._domain_service.requires_new_lot(command.transaction_type):
            return await self._create_new_lot(command)

        return await self._verify_existing_lot(command)


    async def _create_new_lot(self, command: InventoryMovementCommand) -> int:
        """
        Valida unicidad del código de lote, construye la entidad usando
        el factory method, la persiste y retorna el ID asignado por la DB.
        """
        lot_data = command.new_lot_data

        already_exists = await self._lot_repository.exists_by_code(
            item_id=command.item_id,
            lot_code=lot_data.lot_code,
        )
        if already_exists:
            raise DuplicateLotCodeError(command.item_id, lot_data.lot_code)

        new_lot = InventoryLot.create(
            item_id=command.item_id,
            lot_code=lot_data.lot_code,
            unit_cost=lot_data.unit_cost,
            expiration_date=lot_data.expiration_date,
            production_date=lot_data.production_date,
        )
        
        persisted_lot = await self._lot_repository.save(new_lot)

        return persisted_lot.id


    async def _verify_existing_lot(self, command: InventoryMovementCommand) -> int:
        """
        Verifica que el lote referenciado exista en el sistema antes de
        intentar operar sobre él.
        """
        lot = await self._lot_repository.get_by_id(command.lot_id)

        if lot is None:
            raise LotNotFoundError(command.lot_id)

        return lot.id


    async def _record_transaction(self, command: InventoryMovementCommand, lot_id: int, signed_quantity: Decimal) -> None:
        """
        Registra el movimiento en el historial inmutable usando el
        factory method de la entidad.
        """
        
        transaction = InventoryTransaction.record(
            item_id=command.item_id,
            lot_id=lot_id,
            signed_quantity=signed_quantity,
            transaction_type=command.transaction_type.value,
            reference_type=command.reference_type,
            reference_id=command.reference_id,
        )
        await self._transaction_repository.add(transaction)

    async def _apply_balance(self, item_id: int, lot_id: int, signed_quantity: Decimal, transaction_type_is_adjustment: bool) -> None:
        """
        Crea o actualiza el balance del lote.

        CASO 1 — Sin balance previo (primer movimiento del lote):
            Ocurre cuando el lote acaba de ser creado por _create_new_lot().

        CASO 2 — Balance existente, operación normal:
            balance.apply_delta() aplica el delta y valida internamente
            que el resultado no sea negativo. Si lo sería, lanza
            InsufficientStockError.

        CASO 3 — Balance existente, ajuste de inventario:
            balance.force_apply_delta() omite la validación de stock
            porque un ajuste refleja la realidad del conteo físico
        """
        existing_balance = await self._balance_repository.get_by_lot(item_id, lot_id)

        if existing_balance is None:
            new_balance = InventoryBalance.initialize(
                item_id=item_id,
                lot_id=lot_id,
                initial_quantity=signed_quantity,
            )
            await self._balance_repository.save(new_balance)
        else:
            if transaction_type_is_adjustment:
                existing_balance.force_apply_delta(signed_quantity)
            else:
                existing_balance.apply_delta(signed_quantity)

            await self._balance_repository.save(existing_balance)