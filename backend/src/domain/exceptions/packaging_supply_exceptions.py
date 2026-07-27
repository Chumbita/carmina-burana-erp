from src.domain.exceptions.item_exceptions import DomainException

class PackagingSupplyNotFoundException(DomainException):
    def __init__(self, item_id: int) -> None:
        super().__init__(f"PackagingSupply with item_id={item_id} was not found.")
        self.item_id = item_id