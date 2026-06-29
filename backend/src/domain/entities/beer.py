# ══════════════════════════════════════════════════════════════════════════════
# BEER ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from ..value_objects.beer_style import BeerStyle

@dataclass
class Beer:
    """
    Entidad especializada de Item.
    Representa una cerveza como producto fabricable del sistema.
    """

    # Atributos esenciales
    style:              BeerStyle
    abv:                float   
    ibu:                int     
    fermentation_days:  int     
    conditioning_days:  int     
    created_at:         datetime
    
    # Identidad (Opcional al inicio, se llena cuando el item base es persistido)
    item_id: Optional[int] = None
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        
        if not self.style or not isinstance(self.style, BeerStyle):
            raise ValueError("style is required and must be a valid BeerStyle")

        if self.abv is None or self.abv < 0:
            raise ValueError("abv cannot be negative")

        if self.abv > 100:
            raise ValueError("abv cannot be greater than 100")

        if self.ibu is None or self.ibu < 0:
            raise ValueError("ibu cannot be negative")

        if self.fermentation_days is None or self.fermentation_days <= 0:
            raise ValueError("fermentation_days must be greater than 0")

        if self.conditioning_days is None or self.conditioning_days <= 0:
            raise ValueError("conditioning_days must be greater than 0")