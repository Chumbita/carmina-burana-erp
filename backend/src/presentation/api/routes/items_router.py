from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from src.domain.exceptions.item_exceptions import ItemNotFoundException
from src.domain.entities.user import User

from src.presentation.schemas.inventory_transaction_schemas import TransactionResponseSchema
from src.presentation.dependencies.use_cases.inventory import get_list_item_transactions_use_case
from src.presentation.dependencies.auth import get_current_user


router = APIRouter(prefix="/items", tags=["Items"])


@router.get(
    "/{item_id}/transactions",
    response_model=List[TransactionResponseSchema],
    summary="Historial de movimientos de inventario de un ítem",
)
async def list_item_transactions(
    item_id: int,
    use_case: "ListItemTransactionsUseCase" = Depends(get_list_item_transactions_use_case),
    current_user: User = Depends(get_current_user),
) -> list[dict]:
    try:
        return await use_case.execute(item_id)
    except ItemNotFoundException as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc