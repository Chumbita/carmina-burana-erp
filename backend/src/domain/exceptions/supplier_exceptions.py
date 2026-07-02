class DuplicateSupplierNameError(Exception):
    def __init__(self, name: str) -> None:
        self.name = name
        super().__init__(f"A supplier with name '{name}' already exists.")


class SupplierNotFoundError(Exception):
    def __init__(self, supplier_id: int) -> None:
        self.supplier_id = supplier_id
        super().__init__(f"Supplier with id '{supplier_id}' not found.")
