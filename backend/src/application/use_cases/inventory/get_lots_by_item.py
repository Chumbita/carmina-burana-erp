from datetime import datetime, timezone, timedelta

from src.domain.repositories.inventory_lot_repository import IInventoryLotRepository, ItemLots
from src.domain.value_objects.lot_status import LotStatus


class GetLotsByItemUseCase:

    def __init__(self, lot_repo: IInventoryLotRepository) -> None:
        self._lot_repo = lot_repo

    async def execute(
        self,
        item_id: int,
        status: set[LotStatus] | None = None,
    ) -> list[ItemLots]:
        lots = await self._lot_repo.find_by_item_id(item_id, status=status)

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        threshold = now + timedelta(days=30)

        for lot in lots:
            lot.status = self._compute_status(lot, now, threshold)

        return lots

    @staticmethod
    def _compute_status(lot: ItemLots, now: datetime, threshold: datetime) -> str:
        if lot.quantity <= 0:
            return LotStatus.DEPLETED

        if lot.expiration_date:
            if lot.expiration_date < now:
                return LotStatus.EXPIRED
            if lot.expiration_date <= threshold:
                return LotStatus.EXPIRING_SOON

        return LotStatus.ACTIVE
