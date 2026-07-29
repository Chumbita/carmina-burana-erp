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
    ) -> Optional[Dict[str, Any]]:
        if not specialized_data:
            return None

        try:
            packaging_supply = await self._repository.get_by_item_id(item_id)

            if packaging_supply is None:
                raise PackagingSupplyNotFoundException(item_id)

            old = {}
            if "packaging_type" in specialized_data:
                raw = packaging_supply.packaging_type
                old["packaging_type"] = raw.value if isinstance(raw, PackagingType) else raw
                packaging_supply.update(packaging_type=PackagingType(specialized_data["packaging_type"]))
            if "material" in specialized_data:
                old["material"] = packaging_supply.material
                packaging_supply.update(material=specialized_data["material"])
            if "capacity_ml" in specialized_data:
                old["capacity_ml"] = packaging_supply.capacity_ml
                packaging_supply.update(capacity_ml=specialized_data["capacity_ml"])

            await self._repository.save(packaging_supply)
            return old

        except SpecializedItemUpdateException:
            raise
        except Exception as exc:
            raise SpecializedItemUpdateException(str(exc)) from exc
