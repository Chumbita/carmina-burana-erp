# ══════════════════════════════════════════════════════════════════════════════
# CASO DE USO PARA LA CREACIÓN DE UN PACKAGING SUPPLY
# ══════════════════════════════════════════════════════════════════════════════

from datetime import datetime, timezone

from src.application.interfaces.specialized_item_creator_port import SpecializedItemCreatorPort
from src.domain.entities.packaging_supply import PackagingSupply
from src.domain.repositories.packaging_supply_repository import IPackagingSupplyRepository
from src.domain.exceptions.item_exceptions import SpecializedItemCreationException
from src.domain.value_objects.packaging_type import PackagingType


class PackagingSupplyItemCreator(SpecializedItemCreatorPort):

    def __init__(self, packaging_supply_repository: IPackagingSupplyRepository) -> None:
        self._packaging_supply_repository = packaging_supply_repository

    async def create(self, item_id: int, command: object) -> None:
        try:
            data = command.specialized_data

            packaging_supply = PackagingSupply(
                item_id=item_id,
                packaging_type=PackagingType(data["packaging_type"]),
                material=data["material"],
                capacity_ml=data.get("capacity_ml"),
                created_at=datetime.now(timezone.utc).replace(tzinfo=None),
            )

            await self._packaging_supply_repository.add(packaging_supply)

        except SpecializedItemCreationException:
            raise
        except Exception as exc:
            raise SpecializedItemCreationException(str(exc)) from exc