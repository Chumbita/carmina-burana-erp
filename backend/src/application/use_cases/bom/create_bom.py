from src.domain.entities.product import Product
from src.domain.entities.bom import Bom
from src.domain.entities.bom import BomItem
from src.domain.repositories.product_repository import IProductRepository
from src.domain.repositories.bom_repository import IBomRepository

from src.application.dtos.bom.create_bom_dto import CreateBomInputDTO

class CreateBomUseCase:
    """
    Caso de uso para la creación de un BOM.
    
    Flujo:
    1. Verificar si el producto ya existe.
    2. Se crea el producto en caso de que este no exista.
    2. Crear un BOM.
    """
    def __init__(
        self,
        product_repository: IProductRepository,
        bom_repository: IBomRepository
        ):
        self._product_repository= product_repository
        self._bom_repository= bom_repository
        
    async def execute(self, data: CreateBomInputDTO) :
        # 1) Verifico si el producto ya existe.
        existing_product= await self._product_repository.find_by_name(data.product.name)
        
        product = existing_product

        # 2) Si el producto no existe, lo creo
        if not product: 
            product= await self._product_repository.create(
                Product(
                    name= data.product.name,
                    product_type= data.product.type,
                    unit= data.product.unit
                )
            )
            
        # 3) Creo el BOM para el producto
        bom_items = [
            BomItem(
                component_type= item.component_type,
                input_id= item.input_id,
                product_id= item.product_id,
                quantity= item.quantity
            )
            for item in data.items
        ]
        
        
        bom = Bom(
            product_id= product.id,
            base_quantity= data.base_quantity,
            base_unit= data.base_unit,
            standard_yield_pct= data.standard_yield_pct,
            items= bom_items
        )
        
        created_bom = await self._bom_repository.create(bom)
        return {
            "product": product,
            "bom": created_bom
        }
            
            