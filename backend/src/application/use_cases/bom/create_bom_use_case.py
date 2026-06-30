# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LA CREACIÓN DE UN BOM (CON VERSIONADO)
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone

from src.application.dtos.bom.bom_commands_dtos import CreateBomCommand
from src.application.dtos.bom.bom_responses_dtos import BomCreatedResponse
from src.domain.entities.bom import Bom, BomLine
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.item_repository import IItemRepostory
from src.domain.repositories.uom_repository import IUomRepository
from src.domain.exceptions.bom_exceptions import BomCreationException, BomNotFoundException
from src.domain.exceptions.item_exceptions import ItemNotFoundException


class CreateBomUseCase:
    """
    Caso de uso para crear una nueva versión de BOM con gestión de versionado.
    """

    def __init__(
        self,
        bom_repository: IBomRepository,
        item_repository: IItemRepostory,
        uom_repository: IUomRepository,
    ) -> None:
        self._bom_repository = bom_repository
        self._item_repository = item_repository
        self._uom_repository = uom_repository

    async def execute(self, command: CreateBomCommand) -> BomCreatedResponse:
        try:
            now = datetime.now(timezone.utc).replace(tzinfo=None)

            # Paso 1: Buscar BOM activo actual
            previous_bom = await self._bom_repository.get_active_by_parent_item_id(
                command.parent_item_id
            )

            # Paso 2: Cerrar versión anterior si existe
            if previous_bom is not None:
                previous_bom.is_active = False
                previous_bom.valid_to = now
                await self._bom_repository.save(previous_bom)

            # Paso 3: Calcular nueva versión
            new_version = (previous_bom.version + 1) if previous_bom else 1

            # Paso 4: Crear nuevo BOM con snapshot completo
            bom = Bom(
                parent_item_id=command.parent_item_id,
                version=new_version,
                is_active=True,
                quantity=command.quantity,
                uom_id=command.uom_id,
                valid_from=command.valid_from or now,
                valid_to=None,
                created_at=now,
                lines=[
                    BomLine(
                        component_item_id=line.component_item_id,
                        quantity=line.quantity,
                        uom=line.uom,
                        created_at=now,
                    )
                    for line in command.lines
                ],
            )

            # Paso 5: Persistir BOM + BomLine (flush, sin commit)
            await self._bom_repository.add(bom)

            # Paso 6: Obtener nombre del item padre
            parent_item = await self._item_repository.get_by_id(command.parent_item_id)
            if parent_item is None:
                raise ItemNotFoundException(command.parent_item_id)

            # Paso 7: Obtener símbolo de la UOM
            uom = await self._uom_repository.get_by_id(command.uom_id)
            uom_symbol = uom.symbol if uom else ""

            # Paso 8: Retornar respuesta ligera para el listado
            return BomCreatedResponse(
                id=bom.id,
                parent_item_id=bom.parent_item_id,
                parent_item_name=parent_item.name,
                version=bom.version,
                components_count=len(bom.lines),
                quantity=bom.quantity,
                uom_id=bom.uom_id,
                uom_symbol=uom_symbol,
                valid_from=bom.valid_from,
            )

        except (BomCreationException, ItemNotFoundException):
            raise
        except Exception as exc:
            raise BomCreationException(str(exc)) from exc
