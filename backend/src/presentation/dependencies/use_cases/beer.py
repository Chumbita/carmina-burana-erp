from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Depends

from src.infrastructure.database.deps import get_db

from src.infrastructure.database.repositories.beer_repository import BeerRepository
from src.infrastructure.database.repositories.item_repository import ItemRepository

from src.application.use_cases.beer.create_beer import BeerItemCreator
from src.application.use_cases.item.create_specialized_item import CreateItemUseCase


def get_create_beer_use_case(
    session: AsyncSession = Depends(get_db),
) -> CreateItemUseCase:
    """
    Fábrica que instancia CreateItemUseCase con el creator específico de beer.
    """
    item_repository = ItemRepository(session)
    beer_repository = BeerRepository(session)
    beer_creator = BeerItemCreator(beer_repository)
    return CreateItemUseCase(item_repository, beer_creator)


def get_beer_repository(
    session: AsyncSession = Depends(get_db),
) -> BeerRepository:
    """Inyecta el repositorio de beer."""
    return BeerRepository(session)
