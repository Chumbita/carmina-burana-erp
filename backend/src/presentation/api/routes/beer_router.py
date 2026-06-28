from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from src.domain.entities.user import User
from src.domain.exceptions.item_exceptions import ItemNotFoundException, SpecializedItemCreationException

from src.infrastructure.database.repositories.beer_repository import BeerRepository

from src.application.dtos.items.item_commands_dtos import CreateItemCommand
from src.application.dtos.beer.beer_dtos import BeerResponse
from src.application.use_cases.item.create_specialized_item import CreateItemUseCase

from src.presentation.schemas.beer_schemas import (
    CreateBeerRequestSchema,
    BeerResponseSchema,
    BeerListResponseSchema,
)
from src.presentation.dependencies.use_cases.beer import (
    get_create_beer_use_case,
    get_beer_repository,
)
from src.presentation.dependencies.auth import get_current_user


router = APIRouter(prefix="/beers", tags=["Beers"])

# ── Defaults de negocio ────────────────────────────────────────────
# Opera con una sola marca y mide la cerveza terminada siempre en litros.
BEER_ITEM_TYPE_ID = 2          # code="beer" en item_type
BEER_BRAND_ID = 1              # única marca de la cervecería
BEER_BASE_UOM_ID = 3           # litros, en la tabla uom

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Create Beer",
    response_model=BeerResponseSchema,
)
async def create_beer(
    body: CreateBeerRequestSchema,
    use_case: CreateItemUseCase = Depends(get_create_beer_use_case),
    beer_repository: BeerRepository = Depends(get_beer_repository),
#    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Crea una cerveza (item + beer) de forma atómica.
    Retorna tanto los datos del item base como los específicos de la cerveza.
    """
    try:
        command = CreateItemCommand(
            name=body.name,
            item_type_id=BEER_ITEM_TYPE_ID,
            brand_id=BEER_BRAND_ID,
            base_uom_id=BEER_BASE_UOM_ID,
            is_stockable=True,
            is_batch_tracked=True,
            min_stock_level=body.min_stock_level,
            is_manufacturable=True,
            is_purchasable=False,
            is_sellable=True,
            specialized_data={
                "style": body.style,
                "abv": body.abv,
                "ibu": body.ibu,
                "fermentation_days": body.fermentation_days,
                "conditioning_days": body.conditioning_days,
            },
        )
        
        item_result = await use_case.execute(command)
        beer = await beer_repository.get_by_item_id(item_result.id)
        
        return BeerResponseSchema(
            id=item_result.id,
            name=item_result.name,
            item_type_id=item_result.item_type_id,
            brand_id=item_result.brand_id,
            base_uom_id=item_result.base_uom_id,
            is_stockable=item_result.is_stockable,
            is_batch_tracked=item_result.is_batch_tracked,
            min_stock_level=item_result.min_stock_level,
            is_manufacturable=item_result.is_manufacturable,
            is_purchasable=item_result.is_purchasable,
            is_sellable=item_result.is_sellable,
            status=item_result.status,
            created_at=item_result.created_at,
            updated_at=item_result.updated_at,
            deleted_at=item_result.deleted_at,
            style=beer.style,
            abv=beer.abv,
            ibu=beer.ibu,
            fermentation_days=beer.fermentation_days,
            conditioning_days=beer.conditioning_days,
            beer_created_at=beer.created_at,
            beer_updated_at=beer.updated_at,
        )
    except SpecializedItemCreationException as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error creating beer: {str(exc)}"
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc)
        ) from exc

