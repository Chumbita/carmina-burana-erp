from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from src.domain.value_objects.supply_category import SupplyCategory

@dataclass
class Supply:
    item_id: int
    supply_category: SupplyCategory
    created_at: datetime
    updated_at: Optional[datetime] = None

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.item_id is None:
            raise ValueError("item_id is required")

        if not self.supply_category:
            raise ValueError("supply_category is required")

        if self.supply_category not in SupplyCategory.__members__.values():
            raise ValueError(f"Invalid supply_category: {self.supply_category}")
    
    def update(self, **kwargs):
        """
        Update parcial del supply.
        """
        allowed_fields = {"supply_category"}
        
        for key, value in kwargs.items():
            if key in allowed_fields:
                setattr(self, key, value)
        
        self.updated_at = datetime.now()
        self._validate()