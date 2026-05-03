from src.application.use_cases.audit_logs.record_audit_log import RecordAuditLogUseCase

IDENTIFY_FILEDS = {"name", "brand", "category"}

class UpdateInputUseCase:

    def __init__(self, repository, audit_log_use_case: RecordAuditLogUseCase = None):
        self.repository = repository
        self._audit_log_use_case = audit_log_use_case

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
        
        # Record audit log for update
        if self._audit_log_use_case:
            # Obtener el objeto actualizado para el after snapshot
            updated_obj = await self.repository.get_input_entity_by_id(input_id)
            
            if updated_obj:
                after_snapshot = {
                    "name": updated_obj.name,
                    "brand": updated_obj.brand,
                    "category": updated_obj.category,
                    "unit": updated_obj.unit,
                    "minimum_stock": float(updated_obj.minimum_stock),
                    "image": updated_obj.image,
                    "status": updated_obj.status
                }
                
                # Validar user_id - si es "0", vacío o inválido, establecer como null
                user_id = data.get("performed_by")
                if user_id in ["0", "", None, 0]:
                    user_id = None
                
                await self._audit_log_use_case.execute(
                    entity_type="input",
                    entity_id=input_id,
                    action="UPDATED",
                    old_data=before_snapshot,
                    new_data=after_snapshot,
                    user_id=user_id
                )
        
        return updated
