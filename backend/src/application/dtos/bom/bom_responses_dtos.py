# ══════════════════════════════════════════════════════════════════════════════
# DTOs - RESPONSES DE BOM
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Optional

from src.domain.entities.bom import Bom


@dataclass
class BomCreatedResponse:
    """
    Respuesta ligera para el frontend tras crear un BOM.
    Contiene solo los campos necesarios para poblar una fila de la tabla de listado.
    """
    id: int
    parent_item_id: int
    parent_item_name: str
    version: int
    components_count: int
    quantity: Decimal
    uom_id: int
    uom_symbol: str
    valid_from: datetime


@dataclass
class BomListItemResponse:
    """
    DTO para cada elemento del listado de BOMs activos.
    """
    id: int
    parent_item_id: int
    parent_item_name: str
    version: int
    components_count: int
    valid_from: datetime

    @classmethod
    def from_dict(cls, data: dict) -> "BomListItemResponse":
        return cls(
            id=data["id"],
            parent_item_id=data["parent_item_id"],
            parent_item_name=data["parent_item_name"],
            version=data["version"],
            components_count=data["components_count"],
            valid_from=data["valid_from"],
        )


@dataclass
class BomLineDetailResponse:
    """
    DTO para cada línea de componente en el detalle de un BOM.
    """
    id: Optional[int]
    component_item_id: int
    component_item_name: str
    quantity: Decimal
    uom_id: Optional[int]
    uom_symbol: Optional[str]


@dataclass
class BomDetailResponse:
    """
    DTO completo para el detalle de un BOM.
    """
    id: int
    parent_item_id: int
    parent_item_name: str
    version: int
    components_count: int
    valid_from: datetime
    created_at: datetime
    lines: List[BomLineDetailResponse] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> "BomDetailResponse":
        return cls(
            id=data["id"],
            parent_item_id=data["parent_item_id"],
            parent_item_name=data["parent_item_name"],
            version=data["version"],
            components_count=data["components_count"],
            valid_from=data["valid_from"],
            created_at=data["created_at"],
            lines=[
                BomLineDetailResponse(
                    id=line["id"],
                    component_item_id=line["component_item_id"],
                    component_item_name=line["component_item_name"],
                    quantity=line["quantity"],
                    uom_id=line["uom_id"],
                    uom_symbol=line["uom_symbol"],
                )
                for line in data["lines"]
            ],
        )
