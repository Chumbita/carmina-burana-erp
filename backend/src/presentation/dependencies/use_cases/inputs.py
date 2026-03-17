# INPUT USE CASE FACTORY
from fastapi import Depends
from src.domain.repositories.input_repository import InputRepository
from src.presentation.dependencies.repositories import get_input_repository

# ===========================
# GET ACTIVE INPUTS USE CASE 
# ===========================
from src.application.use_cases.inputs.list_input import GetActiveInputsUseCase

def get_active_inputs_use_case(
    repository: InputRepository = Depends(get_input_repository)
) -> GetActiveInputsUseCase:
    return GetActiveInputsUseCase(repository)

# ===========================
# GET INPUTS DETAIL USE CASE 
# ===========================
from src.application.use_cases.inputs.list_input import GetInputDetailUseCase

def get_inputs_detail_use_case(
    repository: InputRepository = Depends(get_input_repository)
) -> GetInputDetailUseCase:
    return GetInputDetailUseCase(repository)

# ===========================
# CREATE INPUT USE CASE 
# ===========================
from src.application.use_cases.inputs.create_input import CreateInputUseCase

def get_create_input_use_case(
    repository: InputRepository = Depends(get_input_repository)
) -> CreateInputUseCase:
    return CreateInputUseCase(repository)

# ===========================
# UPDATE INPUT USE CASE 
# ===========================
from src.application.use_cases.inputs.update_input import UpdateInputUseCase

def get_update_input_use_case(
    repository: InputRepository = Depends(get_input_repository)
) -> UpdateInputUseCase:
    return UpdateInputUseCase(repository)

# ===========================
# DELETE INPUT USE CASE 
# ===========================
from src.application.use_cases.inputs.delete_input import DeleteInputUseCase

def get_delete_input_use_case(
    repository: InputRepository = Depends(get_input_repository)
) -> DeleteInputUseCase:
    return DeleteInputUseCase(repository)