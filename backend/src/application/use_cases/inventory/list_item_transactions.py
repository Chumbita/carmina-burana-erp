from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.infrastructure.database.repositories.inventory_transaction_repository import InventoryTransactionRepository
from src.infrastructure.database.repositories.inventory_lot_repository import InventoryLotRepository
from src.infrastructure.database.repositories.item_repository import ItemRepository
from src.infrastructure.database.repositories.uom_repository import UomRepository
from src.presentation.schemas.inventory_transaction_schemas import (
    TRANSACTION_LABELS,
    TransactionResponseSchema,
)
from src.shared.pagination import Page, PaginationParams


class ListItemTransactionsUseCase:
    def __init__(
        self,
        item_repository: ItemRepository,
        transaction_repository: InventoryTransactionRepository,
        lot_repository: InventoryLotRepository,
        uom_repository: UomRepository,
        audit_log_repository=None,
    ) -> None:
        self._item_repository = item_repository
        self._transaction_repository = transaction_repository
        self._lot_repository = lot_repository
        self._uom_repository = uom_repository
        self._audit_log_repository = audit_log_repository

    async def execute(
        self,
        item_id: int,
        params: PaginationParams,
    ) -> Page[dict]:
        item = await self._item_repository.get_by_id(item_id)
        if item is None:
            raise ItemNotFoundException(item_id)

        uom_symbol = (await self._uom_repository.get_symbol_by_id(item.base_uom_id)) or ""

        transactions, total = await self._transaction_repository.list_by_item(
            item_id,
            offset=params.offset,
            limit=params.limit,
        )
        if not transactions:
            return Page(items=[], total_items=0, params=params)

        lot_ids = {txn.lot_id for txn in transactions}
        lots_list = await self._lot_repository.list_by_ids(list(lot_ids))
        lots = {lot.id: lot.lot_code for lot in lots_list}

        # Mapa txn_id -> reason para ajustes, desde audit_logs (entity_type supply)
        # Necesario porque `inventory_transaction` no guarda `reason`; el motivo vive en audit new_data.reason
        txn_reason: dict[int, str] = {}
        if self._audit_log_repository:
            try:
                audits, _ = await self._audit_log_repository.get_by_entity("supply", item_id)
                # Filtrar solo audits de ajuste (tienen reason y lot_id)
                adjustment_audits = []
                for a in audits:
                    if a.action != "UPDATED":
                        continue
                    r = (a.new_data or {}).get("reason")
                    lid = (a.old_data or {}).get("lot_id")
                    if not r or lid is None:
                        continue
                    try:
                        adjustment_audits.append((int(lid), str(r), a.created_at))
                    except Exception:
                        continue
                # Para cada transacción de ajuste, buscar el audit más cercano en tiempo y lot
                for txn in transactions:
                    if txn.transaction_type != "INVENTORY_COUNT_ADJUSTMENT":
                        continue
                    best = None
                    best_dt = None
                    for lid, reason, created_at in adjustment_audits:
                        if lid != txn.lot_id:
                            continue
                        # Diferencia absoluta en segundos (ambos naive UTC)
                        try:
                            dt = abs((created_at - txn.created_at).total_seconds())
                        except Exception:
                            dt = 999999
                        if best is None or dt < best_dt:
                            best = reason
                            best_dt = dt
                            if dt < 2:  # match casi exacto
                                break
                    if best is not None and (best_dt is None or best_dt < 60):
                        txn_reason[txn.id] = best
                    elif best is not None:
                        txn_reason[txn.id] = best
            except Exception:
                txn_reason = {}

        return Page(
            items=[
                TransactionResponseSchema(
                    id=txn.id,
                    lot_id=txn.lot_id,
                    lot_code=lots.get(txn.lot_id, ""),
                    quantity=txn.quantity,
                    uom_symbol=uom_symbol,
                    transaction_type=txn.transaction_type,
                    transaction_label=TRANSACTION_LABELS.get(
                        txn.transaction_type, txn.transaction_type
                    ),
                    reference_type=txn.reference_type,
                    reference_id=txn.reference_id,
                    created_at=txn.created_at,
                    reason=txn_reason.get(txn.id) if txn.transaction_type == "INVENTORY_COUNT_ADJUSTMENT" else None,
                ).model_dump()
                for txn in transactions
            ],
            total_items=total,
            params=params,
        )