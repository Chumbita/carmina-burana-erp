"""
Seed de datos ficticios para probar paginación de BOM y Production Orders.
Crea productos (cervezas), BOMs y órdenes de producción en varios estados.

Uso: python -m scripts.seed_bom_and_production_data
"""

import asyncio
from datetime import datetime, date, timezone, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.session import AsyncSessionLocal
from src.infrastructure.database.models.brand_model import BrandModel
from src.infrastructure.database.models.item_type_model import ItemTypeModel
from src.infrastructure.database.models.product_type_model import ProductTypeModel
from src.infrastructure.database.models.uom_model import UomModel
from src.infrastructure.database.models.item_model import ItemModel
from src.infrastructure.database.models.product_model import ProductModel
from src.infrastructure.database.models.bom_model import BomModel
from src.infrastructure.database.models.bom_line_model import BomLineModel
from src.infrastructure.database.models.production_order_model import ProductionOrderModel


BEERS_DATA = [
    {"name": "Amber Ale", "net_content": "330", "packaging_size": 12, "malt": "6", "hop": "0.2"},
    {"name": "Blonde Ale", "net_content": "330", "packaging_size": 12, "malt": "5", "hop": "0.15"},
    {"name": "Chocolate Stout", "net_content": "500", "packaging_size": 6, "malt": "7", "hop": "0.3"},
    {"name": "Golden Lager", "net_content": "330", "packaging_size": 12, "malt": "5.5", "hop": "0.18"},
    {"name": "Hefeweizen", "net_content": "500", "packaging_size": 6, "malt": "5", "hop": "0.1"},
    {"name": "Imperial IPA", "net_content": "330", "packaging_size": 12, "malt": "8", "hop": "0.5"},
    {"name": "Märzen", "net_content": "500", "packaging_size": 6, "malt": "6.5", "hop": "0.2"},
    {"name": "Oatmeal Stout", "net_content": "330", "packaging_size": 12, "malt": "7", "hop": "0.25"},
    {"name": "Pale Ale", "net_content": "330", "packaging_size": 12, "malt": "5.5", "hop": "0.3"},
    {"name": "Porter", "net_content": "500", "packaging_size": 6, "malt": "6.5", "hop": "0.2"},
    {"name": "Pilsner Urquell Style", "net_content": "330", "packaging_size": 12, "malt": "5", "hop": "0.25"},
    {"name": "Saison", "net_content": "330", "packaging_size": 12, "malt": "5.5", "hop": "0.15"},
    {"name": "Scotch Ale", "net_content": "500", "packaging_size": 6, "malt": "7.5", "hop": "0.1"},
    {"name": "Session IPA", "net_content": "330", "packaging_size": 12, "malt": "4.5", "hop": "0.4"},
    {"name": "Vienna Lager", "net_content": "330", "packaging_size": 12, "malt": "6", "hop": "0.2"},
    # --- 15 más para llegar a 30 ---
    {"name": "Brown Ale", "net_content": "330", "packaging_size": 12, "malt": "5.5", "hop": "0.18"},
    {"name": "Cream Ale", "net_content": "330", "packaging_size": 12, "malt": "4.8", "hop": "0.12"},
    {"name": "Double IPA", "net_content": "330", "packaging_size": 12, "malt": "7.5", "hop": "0.6"},
    {"name": "Dry Stout", "net_content": "330", "packaging_size": 12, "malt": "6", "hop": "0.2"},
    {"name": "ESB", "net_content": "500", "packaging_size": 6, "malt": "6.2", "hop": "0.22"},
    {"name": "Gose", "net_content": "330", "packaging_size": 12, "malt": "4.5", "hop": "0.08"},
    {"name": "Kölsch", "net_content": "330", "packaging_size": 12, "malt": "5", "hop": "0.12"},
    {"name": "Mild Ale", "net_content": "500", "packaging_size": 6, "malt": "4.8", "hop": "0.1"},
    {"name": "Red IPA", "net_content": "330", "packaging_size": 12, "malt": "6", "hop": "0.35"},
    {"name": "Robust Porter", "net_content": "500", "packaging_size": 6, "malt": "7", "hop": "0.25"},
    {"name": "Schwarzbier", "net_content": "330", "packaging_size": 12, "malt": "5.2", "hop": "0.15"},
    {"name": "Tripel", "net_content": "330", "packaging_size": 12, "malt": "6.5", "hop": "0.2"},
    {"name": "Winter Warmer", "net_content": "500", "packaging_size": 6, "malt": "7", "hop": "0.3"},
    {"name": "Barley Wine", "net_content": "330", "packaging_size": 12, "malt": "9", "hop": "0.45"},
    {"name": "Belgian Dubbel", "net_content": "330", "packaging_size": 12, "malt": "6", "hop": "0.18"},
]


async def seed() -> None:
    session: AsyncSession
    async with AsyncSessionLocal() as session:
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        # ── Resolve existing entities ────────────────────────────
        brand = (await session.execute(
            select(BrandModel).where(BrandModel.name == "Carmina Burana")
        )).scalar_one_or_none()
        if not brand:
            print("ERROR: run seed_dev_data.py first (needs brand 'Carmina Burana')")
            return

        item_type_beer = (await session.execute(
            select(ItemTypeModel).where(ItemTypeModel.code == "beer")
        )).scalar_one_or_none()
        if not item_type_beer:
            print("ERROR: run seed_item_types.py first (needs item_type 'beer')")
            return

        product_type = (await session.execute(
            select(ProductTypeModel).where(ProductTypeModel.code == "LAGER")
        )).scalar_one_or_none()
        if not product_type:
            product_type = ProductTypeModel(code="LAGER", name="Lager")
            session.add(product_type)
            await session.flush()
            print(f"  OK product_type: LAGER (id={product_type.id})")

        uom_l = (await session.execute(
            select(UomModel).where(UomModel.symbol == "L")
        )).scalar_one()
        uom_kg = (await session.execute(
            select(UomModel).where(UomModel.symbol == "kg")
        )).scalar_one()
        uom_un = (await session.execute(
            select(UomModel).where(UomModel.symbol == "un")
        )).scalar_one()

        # ── Supplies (componentes) ──────────────────────────────
        supplies = {}
        for name in ["Malta Pilsen", "Lúpulo Cascade", "Levadura US-05", "CO₂"]:
            item = (await session.execute(
                select(ItemModel).where(ItemModel.name == name)
            )).scalar_one_or_none()
            if item:
                supplies[name] = item
        print(f"  Supplies encontrados: {list(supplies.keys())}")

        # ── Products (cervezas) ─────────────────────────────────
        beer_items = {}
        for bd in BEERS_DATA:
            existing = (await session.execute(
                select(ItemModel).where(ItemModel.name == bd["name"])
            )).scalar_one_or_none()
            if existing:
                print(f"  SKIP beer: {bd['name']} (already exists)")
                beer_items[bd["name"]] = existing
                continue

            item = ItemModel(
                name=bd["name"],
                item_type_id=item_type_beer.id,
                brand_id=brand.id,
                base_uom_id=uom_l.id,
                is_stockable=True,
                is_batch_tracked=True,
                min_stock_level=Decimal("0"),
                is_manufacturable=True,
                is_purchasable=False,
                is_sellable=True,
                status="ACTIVE",
                created_at=now,
            )
            session.add(item)
            await session.flush()

            product = ProductModel(
                item_id=item.id,
                product_type_id=product_type.id,
                net_content=Decimal(bd["net_content"]),
                packaging_size=bd["packaging_size"],
                created_at=now,
            )
            session.add(product)
            await session.flush()

            beer_items[bd["name"]] = item
            print(f"  OK beer: {bd['name']} (item_id={item.id})")

        # ── BOMs (1 per beer) ───────────────────────────────────
        bom_map = {}
        for bd in BEERS_DATA:
            beer_item = beer_items.get(bd["name"])
            if not beer_item:
                print(f"  SKIP BOM: {bd['name']} (beer item not found)")
                continue

            existing = (await session.execute(
                select(BomModel).where(
                    BomModel.parent_item_id == beer_item.id,
                    BomModel.is_active == True,
                )
            )).scalar_one_or_none()
            if existing:
                print(f"  SKIP BOM: {bd['name']} (already exists)")
                bom_map[bd["name"]] = existing
                continue

            # Cerrar versiones anteriores activas
            old_versions = (await session.execute(
                select(BomModel).where(
                    BomModel.parent_item_id == beer_item.id,
                    BomModel.is_active == True,
                )
            )).scalars().all()
            for ov in old_versions:
                ov.is_active = False
                ov.valid_to = now

            max_ver = (await session.execute(
                select(BomModel.version).where(
                    BomModel.parent_item_id == beer_item.id
                ).order_by(BomModel.version.desc()).limit(1)
            )).scalar_one_or_none()
            next_version = (max_ver or 0) + 1

            bom = BomModel(
                parent_item_id=beer_item.id,
                version=next_version,
                is_active=True,
                quantity=Decimal("20"),
                uom_id=uom_l.id,
                valid_from=now,
                created_at=now,
            )
            session.add(bom)
            await session.flush()

            lines_data = [
                ("Malta Pilsen", bd["malt"], "kg"),
                ("Lúpulo Cascade", bd["hop"], "kg"),
                ("Levadura US-05", "1", "un"),
            ]
            for supply_name, qty, sym in lines_data:
                supply_item = supplies.get(supply_name)
                if not supply_item:
                    print(f"  WARN: supply '{supply_name}' not found, skipping line")
                    continue
                uom = {"kg": uom_kg, "un": uom_un, "L": uom_l}[sym]
                line = BomLineModel(
                    bom_id=bom.id,
                    component_item_id=supply_item.id,
                    quantity=Decimal(qty),
                    uom=uom.id,
                    created_at=now,
                )
                session.add(line)

            await session.flush()
            bom_map[bd["name"]] = bom
            print(f"  OK BOM: {bd['name']} v{next_version} (bom_id={bom.id})")

        # ── Production Orders ───────────────────────────────────
        beers_list = list(beer_items.keys())
        orders_created = 0

        # 30 PLANNED orders
        for i in range(30):
            beer_name = beers_list[i % len(beers_list)]
            bom = bom_map.get(beer_name)
            beer_item = beer_items.get(beer_name)
            if not bom or not beer_item:
                continue

            base_date = date(2026, 2, 1) + timedelta(days=i)
            order = ProductionOrderModel(
                item_id=beer_item.id,
                bom_id=bom.id,
                planned_quantity=Decimal("100"),
                produced_quantity=Decimal("0"),
                status="PLANNED",
                schedule_date=base_date,
                completed_at=None,
                description=f"Plan #{i+1} - {beer_name}",
                created_at=datetime.combine(base_date - timedelta(days=2), datetime.min.time()),
            )
            session.add(order)
            await session.flush()
            orders_created += 1

        # 30 non-PLANNED: 15 DONE + 10 CANCELLED + 5 DISCARDED
        non_planned = ["DONE"] * 15 + ["CANCELLED"] * 10 + ["DISCARDED"] * 5
        for i, status in enumerate(non_planned):
            beer_name = beers_list[i % len(beers_list)]
            bom = bom_map.get(beer_name)
            beer_item = beer_items.get(beer_name)
            if not bom or not beer_item:
                continue

            base_date = date(2026, 1, 1) + timedelta(days=i)
            completed = datetime.combine(base_date + timedelta(days=1), datetime.min.time()) if status in ("DONE", "CANCELLED", "DISCARDED") else None
            order = ProductionOrderModel(
                item_id=beer_item.id,
                bom_id=bom.id,
                planned_quantity=Decimal("100"),
                produced_quantity=Decimal("100") if status == "DONE" else Decimal("0"),
                status=status,
                schedule_date=base_date,
                completed_at=completed,
                description=f"{status} #{i+1} - {beer_name}",
                created_at=datetime.combine(base_date - timedelta(days=1), datetime.min.time()),
            )
            session.add(order)
            await session.flush()
            orders_created += 1

        await session.commit()
        print(f"\n✅ Seed completado: {len(beer_items)} cervezas, {len(bom_map)} BOMs, {orders_created} órdenes de producción.")


if __name__ == "__main__":
    asyncio.run(seed())
