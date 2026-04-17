from datetime import datetime, timezone

from src.domain.entities.supply import Supply
from src.domain.ports.specialized_item_creator_port import SpecializedItemCreatorPort
from src.domain.exceptions.item_exceptions import SpecializedItemCreationException
from src.domain.repositories.supply_repository import ISupplyRepository
from src.domain.value_objects.supply_category import SupplyCategory


class SupplyItemCreator(SpecializedItemCreatorPort):

    def __init__(self, supply_repository: ISupplyRepository) -> None:
        self._supply_repository = supply_repository

    async def create(self, item_id: int, command: object) -> None:
        try:
            data = command.specialized_data

            supply = Supply(
                item_id=item_id,
                supply_category=SupplyCategory(data["supply_category"]),
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )

            await self._supply_repository.add(supply)

        except SpecializedItemCreationException:
            raise
        except Exception as exc:
            raise SpecializedItemCreationException(str(exc)) from exc