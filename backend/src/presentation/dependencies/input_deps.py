from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.input_repository_impl import (InputRepositoryImpl)
from src.application.use_cases.inputs.create_input import CreateInputUseCase
from src.application.use_cases.inputs.delete_input import DeleteInputUseCase
from src.application.use_cases.inputs.update_input import UpdateInputUseCase
from src.application.use_cases.inputs.list_input import GetActiveInputsUseCase
from src.application.use_cases.inputs.list_input import GetInputDetailUseCase
from src.application.use_cases.record_input_movement import RecordInputMovementUseCase
from src.application.use_cases.get_input_movements import GetInputMovementsUseCase
from src.infrastructure.database.repositories.movement_repository import MovementRepository

def get_create_input_use_case(
        db: AsyncSession = Depends(get_db)
) -> CreateInputUseCase:
    """
    Fábrica del caso de uso CreateInputUseCase.
    Acá se construyen las dependencias concretas.
    """
    repository = InputRepositoryImpl(db)
    movement_repo = MovementRepository(db)
    movement_use_case = RecordInputMovementUseCase(movement_repo)
    return CreateInputUseCase(repository, movement_use_case)

def get_delete_input_use_case(
        db: AsyncSession = Depends(get_db)
) -> DeleteInputUseCase:
    repository = InputRepositoryImpl(db)
    return DeleteInputUseCase(repository)

def get_active_inputs_use_case(
        db: AsyncSession = Depends(get_db)
) -> GetActiveInputsUseCase:
    repository = InputRepositoryImpl(db)
    return GetActiveInputsUseCase(repository)

def get_update_inputs_use_case(
        db: AsyncSession = Depends(get_db)
) -> UpdateInputUseCase:
    repository = InputRepositoryImpl(db)
    movement_repo = MovementRepository(db)
    movement_use_case = RecordInputMovementUseCase(movement_repo)
    return UpdateInputUseCase(repository, movement_use_case)
def get_inputs_detail_use_case(
        db: AsyncSession = Depends(get_db)
) -> GetInputDetailUseCase:
    repository = InputRepositoryImpl(db)
    return GetInputDetailUseCase(repository)

def get_movements_use_case(
        db: AsyncSession = Depends(get_db)
) -> GetInputMovementsUseCase:
    movement_repo = MovementRepository(db)
    return GetInputMovementsUseCase(movement_repo)
