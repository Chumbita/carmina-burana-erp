from src.application.use_cases.record_input_movement import RecordInputMovementUseCase

IDENTIFY_FILEDS = {"name", "brand", "category"}

class UpdateInputUseCase:

    def __init__(self, repository, movement_use_case: RecordInputMovementUseCase = None):
        self.repository = repository
        self._movement_use_case = movement_use_case

    async def execute(self, input_id: int, data: dict):

        input_obj = await self.repository.get_input_entity_by_id(input_id)

        if not input_obj:
            raise Exception("Insumo no encontrado")
        
        # Create before snapshot
        before_snapshot = {
            "name": input_obj.name,
            "brand": input_obj.brand,
            "category": input_obj.category,
            "unit": input_obj.unit,
            "minimum_stock": float(input_obj.minimum_stock),
            "image": input_obj.image,
            "status": input_obj.status
        }
        
        if IDENTIFY_FILEDS.intersection(data.keys()):
            new_name = data.get("name", input_obj.name)
            new_brand = data.get("brand", input_obj.brand)
            new_category = data.get("category", input_obj.category)

            existing = await self.repository.find_by_identity(
                exclude_id=input_id,
                name=new_name,
                brand=new_brand,
                category=new_category,
            )

            if existing:
                if existing.status:
                    raise Exception(
                        "Ya existe un insumo activo con ese nombre, marca y categoría"
                    )
                else:
                    raise Exception(
                        "Existe un insumo inactivo con esa identidad"
                    )
        updated = await self.repository.update(input_id, data)
        
        # Record movement for update
        if self._movement_use_case:
            # Create after snapshot
            after_snapshot = before_snapshot.copy()
            after_snapshot.update(data)
            
            # Validar performed_by - si es "0", vacío o inválido, establecer como null
            performed_by = data.get("performed_by")
            if performed_by in ["0", "", None, 0]:
                performed_by = None
            
            await self._movement_use_case.execute(
                input_id=input_id,
                event_type="UPDATED",
                before=before_snapshot,
                after=after_snapshot,
                performed_by=performed_by
            )
        
        return updated
