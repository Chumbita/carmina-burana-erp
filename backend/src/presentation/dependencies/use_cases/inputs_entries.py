from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.input_entry_repository_impl import InputEntryRepositoryImpl
from src.infrastructure.database.repositories.input_repository_impl import InputRepositoryImpl
from src.application.use_cases.inputs_entries.create_input_entry import RegisterInputEntry
from src.application.use_cases.inputs_entries.list_input_entries import ListInputEntries
from src.application.use_cases.inputs_entries.get_input_entry_detail import GetInputEntryDetail
from src.application.use_cases.inputs_entries.cancel_input_entry import CancelInputEntry

# ===========================
# CREATE INPUT ENTRY
# ===========================
async def get_register_input_entry(
    session: AsyncSession = Depends(get_db)
) -> RegisterInputEntry:
    input_entry_repo = InputEntryRepositoryImpl(session)
    input_repo = InputRepositoryImpl(session)
    return RegisterInputEntry(
        input_entry_repo=input_entry_repo,
        input_repo=input_repo,
    )

# ===========================
# LIST INPUT ENTRIES
# ===========================
async def get_list_input_entries(
    session: AsyncSession = Depends(get_db)
) -> ListInputEntries:
    input_entry_repo = InputEntryRepositoryImpl(session)
    return ListInputEntries(input_entry_repository=input_entry_repo)

# ===========================
# GET INPUT ENTRY DETAIL
# ===========================
async def get_get_input_entry_detail(
    session: AsyncSession = Depends(get_db)
) -> GetInputEntryDetail:
    input_entry_repo = InputEntryRepositoryImpl(session)
    return GetInputEntryDetail(input_entry_repository=input_entry_repo)

# ===========================
# CANCEL INPUT ENTRY
# ===========================
async def get_cancel_input_entry(
    session: AsyncSession = Depends(get_db)
) -> CancelInputEntry:
    input_entry_repo = InputEntryRepositoryImpl(session)
    return CancelInputEntry(input_entry_repository=input_entry_repo)