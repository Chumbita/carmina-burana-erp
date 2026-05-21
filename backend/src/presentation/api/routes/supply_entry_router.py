from fastapi import APIRouter, Depends, status

from src.presentation.schemas.supply_entry_schema import (
    CreateSupplyEntryRequest,
    SupplyEntryResponse,
    SupplyEntryDetailResponse,
)
from src.presentation.dependencies.use_cases.supply_entry import (
    get_create_supply_entry_use_case,
    build_get_supply_entry_detail,
)
from src.application.use_cases.supply_entry.create_supply_entry import CreateSupplyEntryUseCase
from src.application.use_cases.supply_entry.get_supply_entry_detail import GetSupplyEntryDetail
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


@router.get(
    "/{entry_id}",
    response_model=SupplyEntryDetailResponse,
    summary="Obtener detalle de una entrada de insumos",
)
async def get_supply_entry_detail(
    entry_id: int,
    use_case: GetSupplyEntryDetail = Depends(build_get_supply_entry_detail),
) -> SupplyEntryDetailResponse:
    return await use_case.execute(entry_id)
