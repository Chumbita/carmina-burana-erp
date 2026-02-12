import asyncio
from sqlalchemy.future import select
from sqlalchemy import func
from datetime import date

from src.infrastructure.database.session import AsyncSessionLocal
from src.infrastructure.database.models import (
    InputModel,
    InputEntryModel,
    InputEntryItemModel,
    InputInventoryModel,
)

async def seed():
    async with AsyncSessionLocal() as session:
        # 1. Crear insumo
        input_obj = InputModel(
            name="Malta",
            brand="Cargill",
            category="Granos",
            unit="kg",
            minimum_stock=10,
        )
        session.add(input_obj)
        await session.flush()  # ← obtiene ID sin commit

        # 2. Crear entrada
        entry = InputEntryModel(
            id_supplier=1,
            entry_date=func.current_date(),
        )
        session.add(entry)
        await session.flush()

        # 3. Crear lote con stock disponible
        item = InputEntryItemModel(
            id_entry=entry.id,
            id_input=input_obj.id,
            amount=100,
            expire_date=date(2026, 12, 31),
        )
        session.add(item)
        await session.commit()

        # 4. Crear inventario asociado al lote
        inventory = InputInventoryModel(
            id_entry_item=item.id,
            current_amount=item.amount,
            status=True,          
            updated_at=func.now(),       
        )   
        session.add(inventory)
        await session.commit()


        print("✅ Seed creado correctamente")
        print(f"Input ID: {input_obj.id}")
        print(f"Name: {input_obj.name}")
        print("Este insumo NO debería poder eliminarse.")

if __name__ == "__main__":
    asyncio.run(seed())
