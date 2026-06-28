# ══════════════════════════════════════════════════════════════════════════════
# DTOs - BEER
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional

from src.domain.value_objects.item_status_enums import ItemStatus


# --- Create Beer Command ────────────────────────────────────────────

@dataclass
class CreateBeerCommand:
    """
    Comando para crear una cerveza.
    Encapsula tanto los datos del Item base como los específicos de Beer.
    """
    # Datos del Item base
    name: str
    brand_id: int
    base_uom_id: int
    min_stock_level: Decimal
    
    # Datos específicos de Beer
    style: str
    abv: float
    ibu: int
    fermentation_days: int
    conditioning_days: int


# --- Beer Response ──────────────────────────────────────────────────

@dataclass
class BeerResponse:
    """
    Response DTO que combina datos del Item base + especialización Beer.
    """
    # Item base
    id: int
    name: str
    item_type_id: int
    brand_id: int
    base_uom_id: int
    is_stockable: bool
    is_batch_tracked: bool
    min_stock_level: Decimal
    is_manufacturable: bool
    is_purchasable: bool
    is_sellable: bool
    status: ItemStatus
    created_at: datetime
    updated_at: Optional[datetime]
    deleted_at: Optional[datetime]
    
    # Beer específico
    style: str
    abv: float
    ibu: int
    fermentation_days: int
    conditioning_days: int
    beer_created_at: datetime
    beer_updated_at: Optional[datetime] = None
