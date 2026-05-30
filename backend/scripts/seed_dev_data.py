"""
Seed de datos mínimos para desarrollo.
Inserta brand, item_type, uom, supplier, item + supply.

Uso: python -m scripts.seed_dev_data
"""

import asyncio
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.session import AsyncSessionLocal
from src.infrastructure.database.models.brand_model import BrandModel
from src.infrastructure.database.models.item_type_model import ItemTypeModel
from src.infrastructure.database.models.uom_model import UomModel
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.supply_model import SupplyModel
from src.infrastructure.database.models.supplier_model import SupplierModel


SEED_DATA = {
    "brands": [
        {"name": "Carmina Burana"},
    ],
    "item_types": [
        {"code": "supply"},
    ],
    "uoms": [
        {"name": "Kilogramo", "symbol": "kg", "uom_type": "MASS", "is_base": True, "factor_to_base": None},
        {"name": "Unidad", "symbol": "un", "uom_type": "UNIT", "is_base": True, "factor_to_base": None},
        {"name": "Litro", "symbol": "L", "uom_type": "VOLUME", "is_base": True, "factor_to_base": None},
    ],
    "suppliers": [
        {"name": "MaltCo", "status": "ACTIVE"},
        {"name": "HopSupply", "status": "ACTIVE"},
        {"name": "YeastLab", "status": "ACTIVE"},
    ],
    "items": [
        {
            "name": "Malta Pilsen",
            "item_type_code": "supply",
            "brand_name": "Carmina Burana",
            "uom_symbol": "kg",
            "supply_category": "MALT",
        },
        {
            "name": "Lúpulo Cascade",
            "item_type_code": "supply",
            "brand_name": "Carmina Burana",
            "uom_symbol": "kg",
            "supply_category": "HOPS",
        },
        {
            "name": "Levadura US-05",
            "item_type_code": "supply",
            "brand_name": "Carmina Burana",
            "uom_symbol": "un",
            "supply_category": "YEAST",
        },
        {
            "name": "Clarificador",
            "item_type_code": "supply",
            "brand_name": "Carmina Burana",
            "uom_symbol": "L",
            "supply_category": "CLARIFIER",
        },
        {
            "name": "CO₂",
            "item_type_code": "supply",
            "brand_name": "Carmina Burana",
            "uom_symbol": "un",
            "supply_category": "GAS",
        },
    ],
}


async def seed() -> None:
    session: AsyncSession
    async with AsyncSessionLocal() as session:
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        # ── Brands ─────────────────────────────────────────────
        brands = {}
        for b in SEED_DATA["brands"]:
            existing = await session.execute(
                select(BrandModel).where(BrandModel.name == b["name"])
            )
            if existing.scalar_one_or_none():
                print(f"  SKIP brand: {b['name']} (already exists)")
                continue
            model = BrandModel(name=b["name"], created_at=now)
            session.add(model)
            await session.flush()
            brands[b["name"]] = model
            print(f"  OK brand: {b['name']} (id={model.id})")
        await session.flush()

        # ── Item Types ─────────────────────────────────────────
        item_types = {}
        for it in SEED_DATA["item_types"]:
            existing = await session.execute(
                select(ItemTypeModel).where(ItemTypeModel.code == it["code"])
            )
            if existing.scalar_one_or_none():
                print(f"  SKIP item_type: {it['code']} (already exists)")
                continue
            model = ItemTypeModel(code=it["code"])
            session.add(model)
            await session.flush()
            item_types[it["code"]] = model
            print(f"  OK item_type: {it['code']} (id={model.id})")
        await session.flush()

        # ── UOMs ───────────────────────────────────────────────
        uoms = {}
        for u in SEED_DATA["uoms"]:
            existing = await session.execute(
                select(UomModel).where(UomModel.name == u["name"])
            )
            if existing.scalar_one_or_none():
                print(f"  SKIP uom: {u['name']} (already exists)")
                continue
            model = UomModel(
                name=u["name"],
                symbol=u["symbol"],
                uom_type=u["uom_type"],
                is_base=u["is_base"],
                factor_to_base=u["factor_to_base"],
            )
            session.add(model)
            await session.flush()
            uoms[u["name"]] = model
            print(f"  OK uom: {u['name']} (id={model.id})")
        await session.flush()

        # ── Suppliers ──────────────────────────────────────────
        suppliers = {}
        for s in SEED_DATA["suppliers"]:
            existing = await session.execute(
                select(SupplierModel).where(SupplierModel.name == s["name"])
            )
            if existing.scalar_one_or_none():
                print(f"  SKIP supplier: {s['name']} (already exists)")
                continue
            model = SupplierModel(name=s["name"], status=s["status"], created_at=now, updated_at=now)
            session.add(model)
            await session.flush()
            suppliers[s["name"]] = model
            print(f"  OK supplier: {s['name']} (id={model.id})")
        await session.flush()

        # ── Items + Supplies ───────────────────────────────────
        for item_data in SEED_DATA["items"]:
            existing = await session.execute(
                select(ItemModel).where(ItemModel.name == item_data["name"])
            )
            if existing.scalar_one_or_none():
                print(f"  SKIP item: {item_data['name']} (already exists)")
                continue

            item_type = item_types.get(item_data["item_type_code"]) or (
                await session.execute(
                    select(ItemTypeModel).where(ItemTypeModel.code == item_data["item_type_code"])
                )
            ).scalar_one()

            brand = brands.get(item_data["brand_name"]) or (
                await session.execute(
                    select(BrandModel).where(BrandModel.name == item_data["brand_name"])
                )
            ).scalar_one()

            uom = uoms.get(item_data["uom_symbol"]) or (
                await session.execute(
                    select(UomModel).where(UomModel.symbol == item_data["uom_symbol"])
                )
            ).scalar_one()

            item = ItemModel(
                name=item_data["name"],
                item_type_id=item_type.id,
                brand_id=brand.id,
                base_uom_id=uom.id,
                is_stockable=True,
                is_batch_tracked=True,
                min_stock_level=Decimal("0"),
                is_manufacturable=False,
                is_purchasable=True,
                is_sellable=False,
                status="ACTIVE",
                created_at=now,
            )
            session.add(item)
            await session.flush()

            supply = SupplyModel(
                item_id=item.id,
                supply_category=item_data["supply_category"],
                created_at=now,
            )
            session.add(supply)
            await session.flush()

            print(f"  OK item+supply: {item_data['name']} (item_id={item.id})")

        await session.commit()
        print("\n✅ Seed completado.")


if __name__ == "__main__":
    asyncio.run(seed())
