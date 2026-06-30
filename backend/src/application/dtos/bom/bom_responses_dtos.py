# ══════════════════════════════════════════════════════════════════════════════
# DTOs - RESPONSES DE BOM
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
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
