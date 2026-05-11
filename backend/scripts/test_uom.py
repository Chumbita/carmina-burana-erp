import asyncio
from src.infrastructure.database.session import AsyncSessionLocal
from src.infrastructure.database.repositories.uom_repository import UomRepository

async def test():
    async with AsyncSessionLocal() as session:
        repo = UomRepository(session)
        id = 5
        uom = await repo.get_by_id(id)
        
        if uom:
            print(f"✅ UOM encontrada: {uom}")
        else:
            print(f"❌ No se encontró ninguna UOM con id={id}")

if __name__ == "__main__":
    asyncio.run(test())