# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LA CREACIÓN DE UN BOM (CON VERSIONADO)
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from src.application.dtos.bom.bom_commands_dtos import CreateBomCommand
from src.application.dtos.bom.bom_responses_dtos import BomCreatedResponse
from src.domain.entities.bom import Bom, BomLine
from src.domain.exceptions.bom_exceptions import (
    BomCreationException,
    BomNotFoundException,
)
from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.domain.repositories.bom_repository import IBomRepository
from src.domain.repositories.item_repository import IItemRepostory
from src.domain.repositories.uom_repository import IUomRepository
from src.domain.services.audit_log_service import AuditLogService


class CreateBomUseCase:
    """
    Caso de uso para crear una nueva versión de BOM con gestión de versionado.
    Registra auditoría: CREATED si es la primera versión, UPDATED si reemplaza una existente.
    """

    def __init__(
        self,
        bom_repository: IBomRepository,
        item_repository: IItemRepostory,
        uom_repository: IUomRepository,
        audit_log_service: Optional[AuditLogService] = None,
    ) -> None:
        self._bom_repository = bom_repository
        self._item_repository = item_repository
        self._uom_repository = uom_repository
        self._audit_log_service = audit_log_service

    async def execute(
        self, command: CreateBomCommand, user_id: int | None = None
    ) -> BomCreatedResponse:
        try:
            now = datetime.now(timezone.utc).replace(tzinfo=None)

            # Paso 1: Buscar BOM activo actual
            previous_bom = await self._bom_repository.get_active_by_parent_item_id(
                command.parent_item_id
            )

            # Paso 2: Capturar old_data antes de cerrar la versión anterior
            old_data = None
            if previous_bom is not None:
                old_data = await self._extract_bom_data(previous_bom)

            # Paso 3: Cerrar versión anterior si existe
            if previous_bom is not None:
                previous_bom.is_active = False
                previous_bom.valid_to = now
                await self._bom_repository.save(previous_bom)

            # Paso 4: Calcular nueva versión
            new_version = (previous_bom.version + 1) if previous_bom else 1

            # Paso 5: Crear nuevo BOM con snapshot completo
            bom = Bom(
                parent_item_id=command.parent_item_id,
                version=new_version,
                is_active=True,
                quantity=command.quantity,
                uom_id=command.uom_id,
                valid_from=command.valid_from.replace(tzinfo=None)
                if command.valid_from
                else now,
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

            # Paso 6: Persistir BOM + BomLine (flush, sin commit)
            await self._bom_repository.add(bom)

            # Paso 7: Obtener nombre del item padre
            parent_item = await self._item_repository.get_by_id(command.parent_item_id)
            if parent_item is None:
                raise ItemNotFoundException(command.parent_item_id)

            # Paso 8: Obtener símbolo de la UOM (consulta ligera)
            uom_symbol = (
                await self._uom_repository.get_symbol_by_id(command.uom_id) or ""
            )

            # Paso 9: Registrar auditoría
            if self._audit_log_service is not None:
                new_data = await self._extract_bom_data(
                    bom, uom_symbol_override=uom_symbol
                )
                if old_data is not None:
                    await self._audit_log_service.log_bom_update(
                        entity_id=command.parent_item_id,
                        old_data=old_data,
                        new_data=new_data,
                        user_id=user_id,
                    )
                else:
                    await self._audit_log_service.log_bom_create(
                        entity_id=command.parent_item_id,
                        new_data=new_data,
                        user_id=user_id,
                    )

            # Paso 10: Retornar respuesta ligera para el listado
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

    async def _extract_bom_data(
        self, bom: Bom, uom_symbol_override: str | None = None
    ) -> dict:
        """
        Extrae los datos relevantes de un BOM para el log de auditoría.
        Excluye campos de versionado (id, version, is_active, valid_from, valid_to, created_at).
        Resuelve component_item_id -> nombre, uom_id -> símbolo para legibilidad.
        """
        # Resolver símbolo de UOM del header
        if uom_symbol_override is not None:
            header_uom_symbol = uom_symbol_override
        else:
            header_uom_symbol = await self._uom_repository.get_symbol_by_id(
                bom.uom_id
            ) or str(bom.uom_id)

        # Resolver líneas con nombres de componentes
        lines_data = []
        for line in bom.lines or []:
            component_name = ""
            if line.component_item_id:
                component_item = await self._item_repository.get_by_id(
                    line.component_item_id
                )
                component_name = component_item.name if component_item else ""

            line_uom_symbol = ""
            if line.uom:
                line_uom_symbol = (
                    await self._uom_repository.get_symbol_by_id(line.uom) or ""
                )

            lines_data.append(
                {
                    "component_item_id": line.component_item_id,
                    "component_name": component_name,
                    "quantity": float(line.quantity),
                    "uom_symbol": line_uom_symbol,
                }
            )

        return {
            "version": bom.version,
            "quantity": float(bom.quantity),
            "uom_id": bom.uom_id,
            "uom_symbol": header_uom_symbol,
            "lines": lines_data,
        }
