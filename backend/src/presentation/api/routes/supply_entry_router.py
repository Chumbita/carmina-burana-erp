from fastapi import APIRouter, Depends, status

from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user

from src.presentation.schemas.supply_entry_schema import CreateSupplyEntryRequest, SupplyEntryResponse
from src.presentation.dependencies.use_cases.supply_entry import get_create_supply_entry_use_case
from src.application.use_cases.supply_entry.create_supply_entry import CreateSupplyEntryUseCase
from src.application.dtos.supply_entry.supply_entry_commands_dtos import (
    CreateSupplyEntryCommand,
    SupplyEntryLineCommand,
)

router = APIRouter(prefix="/supply-entries", tags=["Supply Entries"])


@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Registrar entrada de insumos",
    response_model=SupplyEntryResponse,
    
)
async def create_supply_entry(
    body: CreateSupplyEntryRequest,
    use_case: CreateSupplyEntryUseCase = Depends(get_create_supply_entry_use_case),
    current_user: User = Depends(get_current_user),
) -> SupplyEntryResponse:
    command = CreateSupplyEntryCommand(
        supplier_id=body.supplier_id,
        document_number=body.document_number,
        entry_date=body.entry_date,
        description=body.description,
        lines=[
            SupplyEntryLineCommand(
                item_id=line.item_id,
                quantity=line.quantity,
                unit_cost=line.unit_cost,
                expiration_date=line.expiration_date,
                lot_code=line.lot_code,
                comment=line.comment,
            )
            for line in body.lines
        ],
    )

    result = await use_case.execute(command)
    return result
