from fastapi import APIRouter, Depends

from src.presentation.schemas.input_schema import InputCreateSchema
from src.application.use_cases.inputs.create_input import CreateInputUseCase
from src.presentation.dependencies.input_deps import get_create_input_use_case

input_router = APIRouter(prefix="/inputs", tags=["Inputs"])

@input_router.post("/")
async def create_input(
    data: InputCreateSchema,
    use_case: CreateInputUseCase = Depends(get_create_input_use_case),
):
    return await use_case.execute(data.model_dump())