"""
Seed para crear los item_types del sistema.
Inserta todos los item_types necesarios para la aplicación.

Uso: python -m scripts.seed_item_types
"""

import asyncio
from sqlalchemy import select
from src.infrastructure.database.session import AsyncSessionLocal
from src.infrastructure.database.models.item_type_model import ItemTypeModel

ITEM_TYPES = [
    {"code": "supply"},
    {"code": "packaging_supply"},
]


async def seed() -> None:
    async with AsyncSessionLocal() as session:
        for it in ITEM_TYPES:
            existing = await session.execute(
                select(ItemTypeModel).where(ItemTypeModel.code == it["code"])
            )
            if existing.scalar_one_or_none():
                print(f"  SKIP item_type: {it['code']} (already exists)")
                continue
            model = ItemTypeModel(code=it["code"])
            session.add(model)
            await session.flush()
            print(f"  OK item_type: {it['code']} (id={model.id})")

        await session.commit()
        print("\n✅ Seed de item_types completado.")


if __name__ == "__main__":
    asyncio.run(seed())