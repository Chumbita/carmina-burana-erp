# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LA CREACIÓN DE UNA CERVEZA
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone

from src.application.interfaces.specialized_item_creator_port import SpecializedItemCreatorPort
from src.domain.entities.beer import Beer
from src.domain.repositories.beer_repository import IBeerRepository
from src.domain.exceptions.item_exceptions import SpecializedItemCreationException


class BeerItemCreator(SpecializedItemCreatorPort):

    def __init__(self, beer_repository: IBeerRepository) -> None:
        self._beer_repository = beer_repository

    async def create(self, item_id: int, command: object) -> None:
        try:
            data = command.specialized_data

            beer = Beer(
                item_id=item_id,
                style=data["style"],
                abv=data["abv"],
                ibu=data["ibu"],
                fermentation_days=data["fermentation_days"],
                conditioning_days=data["conditioning_days"],
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )

            await self._beer_repository.add(beer)

        except SpecializedItemCreationException:
            raise
        except Exception as exc:
            raise SpecializedItemCreationException(str(exc)) from exc