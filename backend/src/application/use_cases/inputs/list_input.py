class GetActiveInputsUseCase:

    def __init__(self, repository):
        self.repository = repository

    async def execute(self):
        return await self.repository.get_active_inputs()
