from fastapi import APIRouter, Depends, HTTPException, status

from src.presentation.schemas.input_schema import InputCreateSchema
from src.application.use_cases.inputs.create_input import CreateInputUseCase
from src.presentation.dependencies.input_deps import get_create_input_use_case
from src.application.use_cases.inputs.delete_input import DeleteInputUseCase
from src.presentation.dependencies.input_deps import get_delete_input_use_case

input_router = APIRouter(prefix="/inputs", tags=["Inputs"])

# CREATE
@input_router.post("/")
async def create_input(
    data: InputCreateSchema,
    use_case: CreateInputUseCase = Depends(get_create_input_use_case),
):
    return await use_case.execute(data.model_dump())

# DELETE
@input_router.delete("/{input_id}")
async def delete_input(
    input_id: int,
    use_case: DeleteInputUseCase = Depends(get_delete_input_use_case),
):
    try:
        await use_case.execute(input_id)
        return {"message": "Insumo eliminado correctamente"}

    except ValueError as e:

        # Mensaje de negocio (stock disponible)
        if "stock" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=str(e)
            )

        # Insumo no encontrado
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )