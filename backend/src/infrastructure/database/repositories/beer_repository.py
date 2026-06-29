# ══════════════════════════════════════════════════════════════════════════════
# REPOSITORIO DE BEER
# ══════════════════════════════════════════════════════════════════════════════

from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.beer import Beer
from src.domain.repositories.beer_repository import IBeerRepository
from src.infrastructure.database.models.beer_model import BeerModel
from src.domain.value_objects.beer_style import BeerStyle


class BeerRepository(IBeerRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Utilidades ────────────────────────────────────────────────

    @staticmethod
    def _to_entity(model: BeerModel) -> Beer:
        return Beer(
            item_id=model.item_id,
            style=BeerStyle(model.style),
            abv=model.abv,                  # asdecimal=False -> ya es float
            ibu=model.ibu,
            fermentation_days=model.fermentation_days,
            conditioning_days=model.conditioning_days,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def _to_model(entity: Beer) -> BeerModel:
        return BeerModel(
            item_id=entity.item_id,
            style=entity.style.value,
            abv=entity.abv,
            ibu=entity.ibu,
            fermentation_days=entity.fermentation_days,
            conditioning_days=entity.conditioning_days,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )

    # ── Queries ────────────────────────────────────────────────

    async def get_by_item_id(self, item_id: int) -> Optional[Beer]:
        """
        Busca una cerveza por item_id y la devuelve como entidad de dominio.
        """
        stmt = select(BeerModel).where(BeerModel.item_id == item_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()

        return self._to_entity(model) if model else None

    async def get_all(self) -> list[Beer]:
        """
        Devuelve todas las cervezas como entidades de dominio.
        """
        stmt = select(BeerModel)
        result = await self._session.execute(stmt)
        models = result.scalars().all()

        return [self._to_entity(model) for model in models]

    # ── Commands ────────────────────────────────────────────────

    async def add(self, beer: Beer) -> None:
        """
        Inserta una nueva cerveza en la base de datos.

        beer.item_id debe estar asignado antes de llamar a este método,
        ya que la cerveza siempre se crea despues del item base
        (ver CreateItemUseCase + SpecializedItemCreatorPort).

        Hace flush sin commit para mantenerse dentro de la misma
        transaccion que la creacion del item base.
        """
        model = self._to_model(beer)
        self._session.add(model)
        await self._session.flush()