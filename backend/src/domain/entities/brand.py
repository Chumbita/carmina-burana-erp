# ══════════════════════════════════════════════════════════════════════════════
# BRAND ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class Brand:
    """
    Entidad marca (brand)
    """

    # Atributos esenciales
    name: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None
    is_active: bool = True

    # Identidad
    id: Optional[int] = None

    # ── Initialization & Validation ────────────────────────────────

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if not self.name or not self.name.strip():
            raise ValueError("'name' attribute is required")

    def update(self, name: str) -> None:
        self.name = name
        self.updated_at = datetime.now()
        self._validate()

    def deactivate(self) -> None:
        if not self.is_active:
            return
        now = datetime.now()
        self.is_active = False
        self.updated_at = now
        self.deleted_at = now
