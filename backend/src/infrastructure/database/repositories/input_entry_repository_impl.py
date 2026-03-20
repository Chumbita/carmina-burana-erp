from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.domain.entities.input_entry import InputEntry,InputInventory,InputEntryItem

from src.domain.repositories.input_entry_repository import InputEntryRepositoryInterface

from src.infrastructure.database.models.input_entry_model import InputEntryModel
from src.infrastructure.database.models.input_entry_item_model import InputEntryItemModel
from src.infrastructure.database.models.input_inventory_model import InputInventoryModel

class InputEntryRepositoryImpl(InputEntryRepositoryInterface):

    def __init__(self, session: AsyncSession):
        self.session = session

    async def save(self, entry: InputEntry) -> InputEntry:
        entry_model = InputEntryModel(
            reception_number=entry.reception_number,
            entry_date=entry.entry_date,
            supplier=entry.supplier,
            total_cost=entry.total_cost,
            description=entry.description,
        )
        self.session.add(entry_model)
        await self.session.flush()

        items_with_lotes = []
        for item in entry.items:
            item_model = InputEntryItemModel(
                id_entry=entry_model.id,
                id_input=item.id_input,
                amount=item.amount,
                unit_cost=item.unit_cost,
                expire_date=item.expire_date,
                comment=item.comment,
            )
            self.session.add(item_model)
            await self.session.flush()

            inventory_model = InputInventoryModel(
                id_entry_item=item_model.id,
                id_input=item.id_input,
                initial_amount=item.amount,
                current_amount=item.amount,
                unit_cost=item.unit_cost,
                expire_date=item.expire_date,
            )
            self.session.add(inventory_model)
            await self.session.flush()

            items_with_lotes.append((item_model, inventory_model))

        await self.session.commit()
        await self.session.refresh(entry_model)

        # Reconstruir entidad completa con todos los ids y lotes
        entry.id = entry_model.id
        entry.created_at = entry_model.created_at

        for i, (item_model, inventory_model) in enumerate(items_with_lotes):
            await self.session.refresh(item_model)
            await self.session.refresh(inventory_model)
            entry.items[i].id = item_model.id
            entry.items[i].lote = InputInventory(
                id=inventory_model.id,
                id_entry_item=inventory_model.id_entry_item,
                id_input=inventory_model.id_input,
                initial_amount=float(inventory_model.initial_amount),
                current_amount=float(inventory_model.current_amount),
                unit_cost=float(inventory_model.unit_cost),
                expire_date=inventory_model.expire_date,
            )

        return entry
