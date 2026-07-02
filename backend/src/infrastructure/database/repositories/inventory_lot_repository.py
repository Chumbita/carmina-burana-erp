# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE LOTES
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import and_, or_, select, update

from src.domain.entities.inventory_lot import InventoryLot
from src.domain.repositories.inventory_lot_repository import ItemLots
from src.domain.value_objects.lot_status import LotStatus
from src.infrastructure.database.models.inventory_balance_model import InventoryBalanceModel
from src.infrastructure.database.models.inventory_lot_model import InventoryLotModel
from src.infrastructure.database.models.inventory_transaction_model import InventoryTransactionModel

class InventoryLotRepository():
    def __init__(self, session: AsyncSession):
        self._session = session
        
    
    # --- Utilidades ---------------------------------------------
    
    @staticmethod
    def _to_model(entity: InventoryLot) -> InventoryLotModel:
        return InventoryLotModel(
            item_id=entity.item_id,
            lot_code=entity.lot_code,
            unit_cost=entity.unit_cost,
            expiration_date=entity.expiration_date,
            production_date=entity.production_date,
            created_at=entity.created_at,
        )
    
    @staticmethod
    def _to_entity(model: InventoryLotModel) -> InventoryLot:
        return InventoryLot(
            id=model.id,
            item_id=model.item_id,
            lot_code=model.lot_code,
            unit_cost=model.unit_cost,
            expiration_date=model.expiration_date,
            production_date=model.production_date,
            created_at=model.created_at,
        )
    
    
    # --- Comportamiento -------------------------------------------
    
    async def save(self, lot: InventoryLot) -> InventoryLot:
        """
        Operacion que internamente decide si insertar o actualizar un registro.
        
        Se utiliza el método "has_been_persisted()" de la entidad para indicar
        si ya tiene ID asignado y así poder decidir entre INSERT y UPDATE.
        """
        if not lot.has_been_persisted():
            lot_model = self._to_model(lot)
            
            self._session.add(lot_model)
            await self._session.flush()
            lot.id = lot_model.id
        else:
            # UPDATE sobre lote existente (si en algún momento se permite editar)
            stmt = (
                update(InventoryLotModel)
                .where(InventoryLotModel.id == lot.id)
                .values(
                    unit_cost=lot.unit_cost,
                    expiration_date=lot.expiration_date,
                    production_date=lot.production_date,
                )
            )
            await self._session.execute(stmt)

        return lot

    
    async def get_by_id(self, lot_id: int) -> Optional[InventoryLot]:
        """ 
        Busca un lote por su ID. Retorna None si no existe.
        """
        result = await self._session.get(InventoryLot, lot_id)
        if result is None:
            return None
        return self._to_entity(result)


    async def find_by_item_id(
        self,
        item_id: int,
        status: set[LotStatus] | None = None,
    ) -> list[ItemLots]:
        supply_entry_subq = (
            select(InventoryTransactionModel.reference_id)
            .where(
                InventoryTransactionModel.lot_id == InventoryLotModel.id,
                InventoryTransactionModel.reference_type == "supply_entry",
                InventoryTransactionModel.transaction_type == "PURCHASE",
            )
            .order_by(InventoryTransactionModel.created_at.desc())
            .limit(1)
            .correlate(InventoryLotModel)
            .scalar_subquery()
        )

        stmt = select(
            InventoryLotModel, InventoryBalanceModel, supply_entry_subq
        ).outerjoin(
            InventoryBalanceModel,
            InventoryBalanceModel.lot_id == InventoryLotModel.id
        ).where(InventoryLotModel.item_id == item_id)

        if status is not None:
            conditions = []
            if LotStatus.ACTIVE in status:
                conditions.append(
                    and_(
                        InventoryBalanceModel.quantity > 0,
                        or_(
                            InventoryLotModel.expiration_date.is_(None),
                            InventoryLotModel.expiration_date >= datetime.now(timezone.utc).replace(tzinfo=None),
                        ),
                    )
                )
            if LotStatus.DEPLETED in status:
                conditions.append(InventoryBalanceModel.quantity <= 0)
            if LotStatus.EXPIRED in status:
                conditions.append(
                    and_(
                        InventoryLotModel.expiration_date.isnot(None),
                        InventoryLotModel.expiration_date < datetime.now(timezone.utc).replace(tzinfo=None),
                        InventoryBalanceModel.quantity > 0,
                    )
                )

            if conditions:
                stmt = stmt.where(or_(*conditions))

        stmt = stmt.order_by(InventoryLotModel.created_at.desc())

        result = await self._session.execute(stmt)
        rows = result.all()

        return [
            ItemLots(
                id=model_lot.id,
                item_id=model_lot.item_id,
                lot_code=model_lot.lot_code,
                unit_cost=model_lot.unit_cost,
                expiration_date=model_lot.expiration_date,
                production_date=model_lot.production_date,
                quantity=model_bal.quantity if model_bal else Decimal("0"),
                reserved_quantity=model_bal.reserved_quantity if model_bal else Decimal("0"),
                created_at=model_lot.created_at,
                supply_entry_id=entry_id,
            )
            for model_lot, model_bal, entry_id in rows
        ]


    async def exists_by_code(self, item_id: int, lot_code: str) -> bool:
        """ 
        Verifica si ya existe un lote con ese código para ese ítem.
        Usado para prevenir duplicados antes de intentar el INSERT.
        """
        stmt = select(InventoryLotModel.id).where(
            InventoryLotModel.item_id == item_id,
            InventoryLotModel.lot_code == lot_code,
        )
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none() is not None