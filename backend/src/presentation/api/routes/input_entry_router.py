from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from datetime import date
from pydantic import BaseModel, Field
from src.presentation.schemas.input_entry_schema import (
    InputEntryRequest, 
    InputEntryResponse,
    InputEntryListResponse,
    InputEntryListItemResponse
)
from src.application.use_cases.inputs_entries.create_input_entry import RegisterInputEntry, RegisterInputEntryDTO, InputEntryItemDTO
from src.application.use_cases.inputs_entries.list_input_entries import ListInputEntries
from src.application.use_cases.inputs_entries.get_input_entry_detail import GetInputEntryDetail
from src.application.use_cases.inputs_entries.cancel_input_entry import CancelInputEntry, CancelInputEntryDTO
from src.presentation.dependencies.use_cases.inputs_entries import (
    get_register_input_entry,
    get_list_input_entries,
    get_get_input_entry_detail,
    get_cancel_input_entry
)
from src.domain.exceptions.input_entry_exceptions import (
    SupplyEntryNotFound,
    SupplyEntryCannotBeCancelled,
    SupplyEntryAlreadyCancelled,
    SupplyEntryItemsConsumed
)

input_entry_router = APIRouter(prefix="/inputs-entries", tags=["inputs-entries"])

# Schema para cancelación
class CancelRequest(BaseModel):
    reason: str = Field(..., min_length=1, description="El motivo de anulación es obligatorio")


@input_entry_router.post("", response_model=InputEntryResponse, status_code=status.HTTP_201_CREATED)
async def create_input_entry(
    request: InputEntryRequest,
    use_case: RegisterInputEntry = Depends(get_register_input_entry),
):
    try:
        dto = RegisterInputEntryDTO(
            entry_date=request.entry_date,
            supplier=request.supplier,
            total_cost=request.total_cost,
            description=request.description,
            items=[
                InputEntryItemDTO(
                    id_input=item.id_input,
                    amount=item.amount,
                    unit_cost=item.unit_cost,
                    expire_date=item.expire_date,
                    comment=item.comment,
                )
                for item in request.items
            ]
        )
        result = await use_case.execute(dto)
        return result

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )


@input_entry_router.get("", response_model=InputEntryListResponse)
async def list_input_entries(
    entry_date_from: date | None = Query(None, description="Fecha de entrada desde"),
    entry_date_to: date | None = Query(None, description="Fecha de entrada hasta"),
    supplier: str | None = Query(None, description="Filtrar por proveedor"),
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(15, ge=1, le=100, description="Resultados por página"),
    use_case: ListInputEntries = Depends(get_list_input_entries),
):
    try:
        result = await use_case.execute(
            entry_date_from=entry_date_from,
            entry_date_to=entry_date_to,
            supplier=supplier,
            page=page,
            limit=limit
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@input_entry_router.get("/{entry_id}", response_model=InputEntryResponse)
async def get_input_entry_detail(
    entry_id: int,
    use_case: GetInputEntryDetail = Depends(get_get_input_entry_detail),
):
    try:
        result = await use_case.execute(entry_id)
        return result
    except SupplyEntryNotFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@input_entry_router.patch("/{entry_id}/cancel", response_model=InputEntryResponse)
async def cancel_input_entry(
    entry_id: int,
    reason: str = Query(..., description="Motivo de anulación"),
    use_case: CancelInputEntry = Depends(get_cancel_input_entry),
):
    try:
        if not reason or not reason.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="El motivo de anulación es obligatorio"
            )
        
        dto = CancelInputEntryDTO(reason=reason)
        result = await use_case.execute(entry_id, dto)
        return result
        
    except SupplyEntryNotFound as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except SupplyEntryCannotBeCancelled as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except SupplyEntryAlreadyCancelled as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except SupplyEntryItemsConsumed as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )