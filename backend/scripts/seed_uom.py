import asyncio

from src.infrastructure.database.session import AsyncSessionLocal
from src.infrastructure.database.models.uom_model import UomModel


async def seed():
    async with AsyncSessionLocal() as session:

        uoms = [
            # ── MASS ──────────────────────────────────────────────
            UomModel(name="Miligramo",  symbol="mg",  uom_type="MASS",   factor_to_base=1,          is_base=True),
            UomModel(name="Gramo",      symbol="g",   uom_type="MASS",   factor_to_base=1_000,      is_base=False),
            UomModel(name="Kilogramo",  symbol="kg",  uom_type="MASS",   factor_to_base=1_000_000,  is_base=False),

            # ── VOLUME ────────────────────────────────────────────
            UomModel(name="Mililitro",  symbol="ml",  uom_type="VOLUME", factor_to_base=1,          is_base=True),
            UomModel(name="Litro",      symbol="L",   uom_type="VOLUME", factor_to_base=1_000,      is_base=False),

            # ── UNIT ──────────────────────────────────────────────
            UomModel(name="Bolsa",      symbol="bolsa",  uom_type="UNIT", factor_to_base=None, is_base=False),
            UomModel(name="Cajón",      symbol="cajón",  uom_type="UNIT", factor_to_base=None, is_base=False),
            UomModel(name="Tambor",     symbol="tambor", uom_type="UNIT", factor_to_base=None, is_base=False),
        ]

        session.add_all(uoms)
        await session.commit()

        print("✅ UOM seed creado correctamente")
        for uom in uoms:
            print(f"  [{uom.uom_type}] {uom.name} ({uom.symbol}) — factor: {uom.factor_to_base} — base: {uom.is_base}")


if __name__ == "__main__":
    asyncio.run(seed())