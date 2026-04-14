from src.domain.exceptions.item_exceptions import DomainException

class SupplyNotFoundException(DomainException):
    def __init__(self, item_id: int) -> None:
        super().__init__(f"Supply with item_id={item_id} was not found.")
        self.item_id = item_id

class SupplyAlreadyExistsException(DomainException):
    def __init__(self, item_id: int) -> None:
        super().__init__(f"Supply with item_id={item_id} already exists.")
        self.item_id = item_id