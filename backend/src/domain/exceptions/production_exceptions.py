# ══════════════════════════════════════════════════════════════════════════════
# EXCEPCIONES DE PRODUCCIÓN
# ══════════════════════════════════════════════════════════════════════════════


class ProductionOrderNotFoundException(Exception):
    def __init__(self, order_id: int):
        super().__init__(f"Production order with id={order_id} not found")
        self.order_id = order_id


class BomNotFoundException(Exception):
    def __init__(self, bom_id: int):
        super().__init__(f"BOM with id={bom_id} not found")
        self.bom_id = bom_id


class BomNotActiveException(Exception):
    def __init__(self, bom_id: int):
        super().__init__(f"BOM with id={bom_id} is not active")
        self.bom_id = bom_id


class InsufficientStockForProductionException(Exception):
    def __init__(self, order_id: int, missing: list):
        self.order_id = order_id
        self.missing = missing
        super().__init__(
            f"Insufficient stock for production order id={order_id}. "
            f"Missing items: {missing}"
        )