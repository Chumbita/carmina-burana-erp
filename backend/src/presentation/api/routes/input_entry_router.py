from fastapi import APIRouter, Depends, HTTPException, status
from src.presentation.schemas.input_entry_schema import InputEntryRequest, InputEntryResponse
from src.application.use_cases.inputs_entries.create_input_entry import RegisterInputEntry, RegisterInputEntryDTO, InputEntryItemDTO
from src.presentation.dependencies.use_cases.inputs_entries import get_register_input_entry

input_entry_router = APIRouter(prefix="/inputs-entries", tags=["inputs-entries"])


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