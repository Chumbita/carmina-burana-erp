from src.domain.exceptions.item_exceptions import DomainException


class BrandNotFoundError(DomainException):
    def __init__(self, brand_id: int) -> None:
        super().__init__(f"Brand with id={brand_id} was not found.")
        self.brand_id = brand_id
