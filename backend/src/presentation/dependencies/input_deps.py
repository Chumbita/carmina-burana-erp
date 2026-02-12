from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.input_repository_impl import (InputRepositoryImpl)
from src.application.use_cases.inputs.create_input import CreateInputUseCase
from src.application.use_cases.inputs.delete_input import DeleteInputUseCase
from src.application.use_cases.inputs.list_input import GetActiveInputsUseCase
from src.application.use_cases.inputs.list_input import GetInputDetailUseCase

def get_create_input_use_case(
        db: AsyncSession = Depends(get_db)
) -> CreateInputUseCase:
    """
    Fábrica del caso de uso CreateInputUseCase.
    Acá se construyen las dependencias concretas.
    """
    repository = InputRepositoryImpl(db)
    return CreateInputUseCase(repository)

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

def get_inputs_detail_use_case(
        db: AsyncSession = Depends(get_db)
) -> GetInputDetailUseCase:
    repository = InputRepositoryImpl(db)
    return GetInputDetailUseCase(repository)
