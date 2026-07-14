from typing import Any, Dict, Optional

from src.application.interfaces.specialized_item_updater import SpecializedItemUpdater
from src.domain.exceptions.item_exceptions import SpecializedItemUpdateException
from src.domain.exceptions.packaging_supply_exceptions import PackagingSupplyNotFoundException
from src.domain.repositories.packaging_supply_repository import IPackagingSupplyRepository
from src.domain.value_objects.packaging_type import PackagingType


class PackagingSupplyItemUpdater(SpecializedItemUpdater):

    def __init__(self, packaging_supply_repository: IPackagingSupplyRepository) -> None:
        self._repository = packaging_supply_repository

    async def update(
        self,
        item_id: int,
        specialized_data: Optional[Dict[str, Any]]
    ) -> None:
        if not specialized_data:
            return

        try:
            packaging_supply = await self._repository.get_by_item_id(item_id)

            if packaging_supply is None:
                raise PackagingSupplyNotFoundException(item_id)

            packaging_type = (
                PackagingType(specialized_data["packaging_type"])
                if "packaging_type" in specialized_data
                else None
            )
            material = specialized_data.get("material")
            capacity_ml = specialized_data.get("capacity_ml")

            packaging_supply.update(
                packaging_type=packaging_type,
                material=material,
                capacity_ml=capacity_ml,
            )

            await self._repository.save(packaging_supply)

        except SpecializedItemUpdateException:
            raise
        except Exception as exc:
            raise SpecializedItemUpdateException(str(exc)) from exc
