from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.input_entry_repository_impl import InputEntryRepositoryImpl
from src.infrastructure.database.repositories.input_repository_impl import InputRepositoryImpl
from src.application.use_cases.inputs_entries.create_input_entry import RegisterInputEntry

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