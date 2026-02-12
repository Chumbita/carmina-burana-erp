IDENTIFY_FILEDS = {"name", "brand", "category"}

class UpdateInputUseCase:

    def __init__(self, repository):
        self.repository = repository

    async def execute(self, input_id: int, data: dict):

        input_obj = await self.repository.get_input_by_id(input_id)

        if not input_obj:
            raise Exception("Insumo no encontrado")
        
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
        return updated
