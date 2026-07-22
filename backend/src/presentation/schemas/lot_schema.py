from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class LotResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    lot_code: str
    unit_cost: Decimal
    quantity: Decimal
    expiration_date: datetime | None = None
    status: str
    created_at: datetime | None = None
    supply_entry_id: int | None = None
