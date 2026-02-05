from fastapi import APIRouter, Depends
from typing import List

from src.presentation.schemas.input_schema import InputCreateSchema
from src.application.use_cases.inputs.create_input import CreateInputUseCase
from src.presentation.dependencies.input_deps import get_create_input_use_case
from src.application.use_cases.inputs.list_input import GetActiveInputsUseCase
from src.presentation.dependencies.input_deps import get_active_inputs_use_case
from src.presentation.schemas.input_response import InputResponse


input_router = APIRouter(prefix="/inputs", tags=["Inputs"])

@input_router.post("/")
async def create_input(
    data: InputCreateSchema,
    use_case: CreateInputUseCase = Depends(get_create_input_use_case),
):
    return await use_case.execute(data.model_dump())

@input_router.get("/", response_model=List[InputResponse])
async def get_active_inputs(
    use_case: GetActiveInputsUseCase = Depends(get_active_inputs_use_case),
):
    return await use_case.execute()

