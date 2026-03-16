from fastapi import APIRouter, Depends

from src.application.use_cases.get_input_movements import GetInputMovementsUseCase
from src.presentation.schemas.movement_schemas import MovementResponse
from src.presentation.dependencies.input_deps import get_movements_use_case

router = APIRouter(prefix="/inputs", tags=["movements"])


@router.get("/{input_id}/movements", response_model=list[MovementResponse])
async def get_input_movements(
    input_id: int,
    use_case: GetInputMovementsUseCase = Depends(get_movements_use_case),
):
    movements = await use_case.execute(input_id)
    return [MovementResponse.from_domain(m) for m in movements]

# Solo existe GET — no hay DELETE ni PUT en este router
