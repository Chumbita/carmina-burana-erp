class SupplyEntryNotFound(Exception):
    """Raised when an input entry is not found"""
    pass

class SupplyEntryCannotBeCancelled(Exception):
    """Raised when an input entry cannot be cancelled (outside 48h window)"""
    pass

class SupplyEntryAlreadyCancelled(Exception):
    """Raised when an input entry is already cancelled"""
    pass

class SupplyEntryItemsConsumed(Exception):
    """Raised when trying to cancel an entry whose items have been consumed"""
    pass

class InvalidSupplyEntryData(Exception):
    """Raised when input entry data is invalid"""
    pass
