from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass(frozen=True)
class InputMovement:
    id: int
    input_id: int
    event_type: str  # "CREATED" | "UPDATED"
    snapshot: dict   # { "before": {...}, "after": {...} }
    occurred_at: datetime
    performed_by: Optional[str] = None
