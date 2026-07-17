class DuplicateSupplierNameError(Exception):
    def __init__(self, name: str) -> None:
        self.name = name
        super().__init__(f"A supplier with name '{name}' already exists.")


class SupplierNotFoundError(Exception):
    def __init__(self, name: str) -> None:
        self.name = name
        super().__init__(f"Supplier with name '{name}' not found.")
