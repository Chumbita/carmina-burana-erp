# ══════════════════════════════════════════════════════════════════════════════
# PRODUCT ENTITY
# ══════════════════════════════════════════════════════════════════════════════

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from typing import Optional


@dataclass
class Product:
    """
    Entidad especializada de Item.
    Representa un producto terminado fabricado (ej: six-pack, lata, barril).
    """

    # Atributos esenciales
    product_type_id: int        # FK a product_type (BOTTLE, CAN, KEG)
    net_content:     Decimal    # Contenido neto por unidad (ej: 355 ml por lata)
    packaging_size:  int        # Unidades por paquete (ej: 6 para un six-pack, 1 para barril)
    created_at:      datetime

    # Identidad (se llena después del flush del item base)
    item_id:    Optional[int]      = None
    updated_at: Optional[datetime] = None

    # ── Initialization & Validation ────────────────────────────────

    def __post_init__(self):
        self._validate()

    def _validate(self):
        if self.product_type_id is None:
            raise ValueError("product_type_id is required")

        if self.net_content is None or self.net_content <= 0:
            raise ValueError("net_content must be greater than 0")

        if self.packaging_size is None or self.packaging_size <= 0:
            raise ValueError("packaging_size must be greater than 0")