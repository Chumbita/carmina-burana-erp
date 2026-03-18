from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class AuditLog:
    id: int
    entity_type: str    # "input" | "product" | "recipe" | "beer" | ...
    entity_id: int
    action: str         # "CREATED" | "UPDATED"
    old_data: dict | None
    new_data: dict | None
    created_at: datetime
    user_id: int | None = None
