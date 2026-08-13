class DuplicateBrandNameError(Exception):
    def __init__(self, name: str) -> None:
        self.name = name
        super().__init__(f"A brand with name '{name}' already exists.")


class BrandNotFoundError(Exception):
    def __init__(self, brand_id: str) -> None:
        self.brand_id = brand_id
        super().__init__(f"Brand with id '{brand_id}' not found.")
