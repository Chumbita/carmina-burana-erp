from src.domain.repositories.input_repository import InputRepository

class DeleteInputUseCase:

    def __init__(self, repository: InputRepository):
        self.repository = repository

    async def execute(self, input_id: int):

        # REGLA DE NEGOCIO
        if await self.repository.has_stock(input_id):
            raise ValueError(
                "Acción no permitida: este insumo tiene lotes activos pendientes de consumo."
            )

        deleted = await self.repository.delete(input_id)

        if not deleted:
            raise ValueError("Insumo no encontrado")