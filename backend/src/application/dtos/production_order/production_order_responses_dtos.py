# ══════════════════════════════════════════════════════════════════════════════
# DTOs - RESPONSES DE PRODUCTION ORDER
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass, field
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List


@dataclass
class ProductionIngredientDetailResponse:
    """
    DTO para cada insumo requerido por una orden de producción planificada.
    La cantidad está escalada a la cantidad planificada de la orden.
    """
    component_item_id: int
    component_item_name: str
    required_quantity: Decimal
    uom_id: Optional[int]
    uom_symbol: Optional[str]


@dataclass
class ProductionConsumptionDetailResponse:
    """
    DTO para cada línea de consumo en el detalle de una orden de producción.
    """
    id: int
    item_id: int
    item_name: str
    lot_id: int
    lot_code: str
    quantity: Decimal
    uom_symbol: Optional[str] = None


@dataclass
class ProductionOutputDetailResponse:
    """
    DTO para cada línea de output en el detalle de una orden de producción.
    """
    id: int
    item_id: int
    item_name: str
    lot_id: int
    lot_code: str
    quantity: Decimal
    uom_symbol: Optional[str] = None


@dataclass
class ProductionOrderDetailResponse:
    """
    DTO completo para el detalle de una orden de producción.
    Para órdenes PLANNED incluye los insumos requeridos (cantidades
    escaladas a la cantidad planificada) y el costo unitario estimado.
    Para DONE/DISCARDED el costo unitario es el real del lote producido.
    """
    id: int
    item_id: int
    item_name: str
    bom_id: int
    bom_version: int
    planned_quantity: Decimal
    produced_quantity: Decimal
    status: str
    base_uom_symbol: str
    schedule_date: Optional[date]
    completed_at: Optional[datetime]
    description: Optional[str]
    created_at: datetime
    unit_cost: Decimal = Decimal("0")
    ingredients: List[ProductionIngredientDetailResponse] = field(default_factory=list)
    consumptions: List[ProductionConsumptionDetailResponse] = field(default_factory=list)
    outputs: List[ProductionOutputDetailResponse] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> "ProductionOrderDetailResponse":
        return cls(
            id=data["id"],
            item_id=data["item_id"],
            item_name=data["item_name"],
            bom_id=data["bom_id"],
            bom_version=data["bom_version"],
            planned_quantity=data["planned_quantity"],
            produced_quantity=data["produced_quantity"],
            status=data["status"],
            base_uom_symbol=data["base_uom_symbol"],
            schedule_date=data["schedule_date"],
            completed_at=data["completed_at"],
            description=data["description"],
            created_at=data["created_at"],
            unit_cost=data.get("unit_cost", Decimal("0")),
            ingredients=[
                ProductionIngredientDetailResponse(
                    component_item_id=ingredient["component_item_id"],
                    component_item_name=ingredient["component_item_name"],
                    required_quantity=ingredient["required_quantity"],
                    uom_id=ingredient.get("uom_id"),
                    uom_symbol=ingredient.get("uom_symbol"),
                )
                for ingredient in data.get("ingredients", [])
            ],
            consumptions=[
                ProductionConsumptionDetailResponse(
                    id=consumption["id"],
                    item_id=consumption["item_id"],
                    item_name=consumption["item_name"],
                    lot_id=consumption["lot_id"],
                    lot_code=consumption["lot_code"],
                    quantity=consumption["quantity"],
                    uom_symbol=consumption.get("uom_symbol"),
                )
                for consumption in data["consumptions"]
            ],
            outputs=[
                ProductionOutputDetailResponse(
                    id=output["id"],
                    item_id=output["item_id"],
                    item_name=output["item_name"],
                    lot_id=output["lot_id"],
                    lot_code=output["lot_code"],
                    quantity=output["quantity"],
                    uom_symbol=output.get("uom_symbol"),
                )
                for output in data["outputs"]
            ],
        )
