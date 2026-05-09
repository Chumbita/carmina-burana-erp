from typing import Any, Dict, Optional

from src.application.interfaces.specialized_item_updater import SpecializedItemUpdater
from src.domain.exceptions.item_exceptions import SpecializedItemUpdateException
from src.domain.exceptions.supply_exceptions import SupplyNotFoundException
from src.domain.repositories.supply_repository import ISupplyRepository
from src.domain.value_objects.supply_category import SupplyCategory


class SupplyItemUpdater(SpecializedItemUpdater):

    def __init__(self, supply_repository: ISupplyRepository) -> None:
        self._supply_repository = supply_repository

    async def update(
        self,
        item_id: int,
        specialized_data: Optional[Dict[str, Any]]
    ) -> None:
        if not specialized_data:
            return

        try:
            supply = await self._supply_repository.get_by_item_id(item_id)

            if supply is None:
                raise SupplyNotFoundException(item_id)

            if "supply_category" in specialized_data:
                supply.supply_category = SupplyCategory(specialized_data["supply_category"])

            await self._supply_repository.save(supply)

        except SpecializedItemUpdateException:
            raise
        except Exception as exc:
            raise SpecializedItemUpdateException(str(exc)) from exc