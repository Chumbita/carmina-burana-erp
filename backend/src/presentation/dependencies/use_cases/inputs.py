# INPUT USE CASE FACTORY
from fastapi import Depends
from src.domain.repositories.input_repository import InputRepository
from src.presentation.dependencies.repositories import get_input_repository
from src.application.use_cases.audit_logs.record_audit_log import RecordAuditLogUseCase
from src.presentation.dependencies.audit_log_deps import get_record_audit_log_use_case

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
    repository: InputRepository = Depends(get_input_repository),
    audit_log_use_case: RecordAuditLogUseCase = Depends(get_record_audit_log_use_case)
) -> CreateInputUseCase:
    return CreateInputUseCase(repository, audit_log_use_case)

# ===========================
# UPDATE INPUT USE CASE 
# ===========================
from src.application.use_cases.inputs.update_input import UpdateInputUseCase

def get_update_input_use_case(
    repository: InputRepository = Depends(get_input_repository),
    audit_log_use_case: RecordAuditLogUseCase = Depends(get_record_audit_log_use_case)
) -> UpdateInputUseCase:
    return UpdateInputUseCase(repository, audit_log_use_case)

# ===========================
# DELETE INPUT USE CASE 
# ===========================
from src.application.use_cases.inputs.delete_input import DeleteInputUseCase

def get_delete_input_use_case(
    repository: InputRepository = Depends(get_input_repository),
    audit_log_use_case: RecordAuditLogUseCase = Depends(get_record_audit_log_use_case)
) -> DeleteInputUseCase:
    return DeleteInputUseCase(repository, audit_log_use_case)