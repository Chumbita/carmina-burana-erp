import asyncio
from sqlalchemy import select

from src.infrastructure.database.session import AsyncSessionLocal
from src.infrastructure.database.models.uom_model import UomModel
from src.domain.services.uom_service import UomConversionService

# convertir una cantidad a la unidad base
async def test_convert_to_base_with_db():
    async with AsyncSessionLocal() as session:
        # busca el UOM kg en la base
        result = await session.execute(
            select(UomModel).where(UomModel.symbol == "kg")
        )
        kg_uom = result.scalar_one()

        # 3 bolsas × 10 kg/bolsa × 1,000,000 mg/kg = 30,000,000 mg
        service = UomConversionService()
        result_value = service.convert_to_base(
            purchase_qty=3,
            conversion_factor=10,
            conversion_uom=kg_uom,
        )
        print("Resultado convert_to_base:", f"{result_value: .2f}")

# convertir desde la unidad base a otra unidad
async def test_convert_between_uoms_with_db():
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            select(UomModel).where(UomModel.symbol == "kg")
        )
        kg_uom = result.scalar_one()

        # 30,000,000 mg ÷ 1,000,000 = 30 kg
        service = UomConversionService()
        result_value = service.convert_between_uoms(
            quantity_in_base=30_000_000,
            to_uom=kg_uom,
        )
        print("Resultado convert_between_uoms:", f"{result_value: .2f}")


async def main():
    await test_convert_to_base_with_db()
    await test_convert_between_uoms_with_db()


if __name__ == "__main__":
    asyncio.run(main())
