from dataclasses import dataclass
from typing import Optional

from src.domain.value_objects.uom_type import UomType


@dataclass
class CreateUomCommand:
    name: str
    symbol: str
    uom_type: UomType
    is_base: bool
    factor_to_base: Optional[float] = None
