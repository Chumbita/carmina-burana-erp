from datetime import date
from src.domain.value_objects.stock_status import StockStatus

class GetActiveInputsUseCase:

    def __init__(self, repository):
        self.repository = repository

    async def execute(self):
        rows = await self.repository.get_active_inputs()

        response = []

        for input_obj, stock_total in rows:

            estado = StockStatus.from_levels(
                float(stock_total),
                float(input_obj.minimum_stock)
            )

            response.append({
                "id": input_obj.id,
                "name": input_obj.name,
                "brand": input_obj.brand,
                "category": input_obj.category,
                "unit": input_obj.unit,
                "minimum_stock": input_obj.minimum_stock,
                "stockTotal": float(stock_total),
                "estadoStock": estado.value,
                "image": input_obj.image,
                "status": input_obj.status
            })
        
        return response
    

class GetInputDetailUseCase:

    def __init__(self, repository):
        self.repository = repository

    async def execute(self, input_id: int):

        data, lots = await self.repository.get_input_by_id(input_id)

        if not data:
            raise Exception("Insumo no encontrado")

        input_obj = data["input"]
        stock_total = data["stock_total"]
       
        estado = StockStatus.from_levels(
            float(stock_total),
            float(input_obj.minimum_stock)
        )

        lots_response = []

        for lot in lots:
            (
                lote_id,
                entry_date,
                cantidad_ingresada,
                current_amount,
                expire_date,
                updated_at,
            ) = lot

            dias_restantes = (
                (expire_date - date.today()).days
                if expire_date
                else None
            )

            lots_response.append(
                {
                    "lote": lote_id,
                    "ingreso": entry_date,
                    "cantidad_ingresada": cantidad_ingresada,
                    "cantidad_actual": current_amount or 0,
                    "vencimiento": expire_date,
                    "dias_restantes": dias_restantes,
                    "updated_at": updated_at,
                }
            )

        return {
            "id": input_obj.id,
            "name": input_obj.name,
            "brand": input_obj.brand,
            "category": input_obj.category,
            "unit": input_obj.unit,
            "minimum_stock": input_obj.minimum_stock,
            "image": input_obj.image,
            "stock_actual": stock_total,
            "estado_stock": estado.value,
            "lotes": lots_response,
        }
