from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Optional, Dict, Any

from src.domain.entities.input_entry import InputEntry,InputInventory,InputEntryItem

from src.domain.repositories.input_entry_repository import InputEntryRepositoryInterface

from src.infrastructure.database.models.input_entry_model import InputEntryModel
from src.infrastructure.database.models.input_entry_item_model import InputEntryItemModel
from src.infrastructure.database.models.input_inventory_model import InputInventoryModel
from src.infrastructure.database.models.input_model import InputModel

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

        items_with_batches = []
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

            items_with_batches.append((item_model, inventory_model))

        await self.session.commit()
        await self.session.refresh(entry_model)

        # Reconstruir entidad completa con todos los ids y lotes
        entry.id = entry_model.id
        entry.created_at = entry_model.created_at

        for i, (item_model, inventory_model) in enumerate(items_with_batches):
            await self.session.refresh(item_model)
            await self.session.refresh(inventory_model)
            entry.items[i].id = item_model.id
            entry.items[i].batch = InputInventory(
                id=inventory_model.id,
                id_entry_item=inventory_model.id_entry_item,
                id_input=inventory_model.id_input,
                initial_amount=float(inventory_model.initial_amount),
                current_amount=float(inventory_model.current_amount),
                unit_cost=float(inventory_model.unit_cost),
                expire_date=inventory_model.expire_date,
            )

        return entry

    async def find_by_id(self, entry_id: int) -> Optional[InputEntry]:
        # Query para obtener la entrada con sus items
        query = (
            select(InputEntryModel)
            .where(InputEntryModel.id == entry_id)
        )
        
        result = await self.session.execute(query)
        entry_model = result.scalar_one_or_none()
        
        if not entry_model:
            return None

        # Query para obtener los items con sus inventarios y nombres de insumos
        items_query = (
            select(InputEntryItemModel, InputInventoryModel, InputModel.name.label('input_name'))
            .join(InputInventoryModel, InputEntryItemModel.id == InputInventoryModel.id_entry_item)
            .join(InputModel, InputEntryItemModel.id_input == InputModel.id)
            .where(InputEntryItemModel.id_entry == entry_id)
        )
        
        items_result = await self.session.execute(items_query)
        items_data = items_result.all()

        # Construir entidades
        items = []
        for item_model, inventory_model, input_name in items_data:
            inventory_entity = InputInventory(
                id=inventory_model.id,
                id_entry_item=inventory_model.id_entry_item,
                id_input=inventory_model.id_input,
                initial_amount=float(inventory_model.initial_amount),
                current_amount=float(inventory_model.current_amount),
                unit_cost=float(inventory_model.unit_cost),
                expire_date=inventory_model.expire_date,
            )
            
            item_entity = InputEntryItem(
                id=item_model.id,
                id_entry=item_model.id_entry,
                id_input=item_model.id_input,
                amount=float(item_model.amount),
                unit_cost=float(item_model.unit_cost),
                expire_date=item_model.expire_date,
                comment=item_model.comment,
                batch=inventory_entity,
                input_name=input_name,
            )
            items.append(item_entity)

        # Construir entrada completa
        entry = InputEntry(
            id=entry_model.id,
            reception_number=entry_model.reception_number,
            entry_date=entry_model.entry_date,
            supplier=entry_model.supplier,
            total_cost=float(entry_model.total_cost),
            description=entry_model.description,
            created_at=entry_model.created_at,
            items=items,
            status=getattr(entry_model, 'status', 'active'),
            annulled_at=getattr(entry_model, 'annulled_at', None),
            annulment_reason=getattr(entry_model, 'annulment_reason', None),
        )

        return entry

    async def find_all(self, filters: Optional[Dict[str, Any]] = None) -> List[InputEntry]:
        # Query para obtener las entradas con conteo de items
        query = (
            select(InputEntryModel, func.count(InputEntryItemModel.id).label('item_count'))
            .outerjoin(InputEntryItemModel, InputEntryModel.id == InputEntryItemModel.id_entry)
            .group_by(InputEntryModel.id)
        )
        
        # Aplicar filtros
        if filters:
            if 'entry_date_from' in filters and filters['entry_date_from']:
                query = query.where(InputEntryModel.entry_date >= filters['entry_date_from'])
            if 'entry_date_to' in filters and filters['entry_date_to']:
                query = query.where(InputEntryModel.entry_date <= filters['entry_date_to'])
            if 'supplier' in filters and filters['supplier']:
                query = query.where(InputEntryModel.supplier.ilike(f"%{filters['supplier']}%"))
        
        # Ordenar por fecha de creación descendente
        query = query.order_by(InputEntryModel.created_at.desc())
        
        result = await self.session.execute(query)
        entry_models_with_counts = result.all()
        
        # Convertir a entidades (sin items para performance del listado)
        entries = []
        for entry_model, item_count in entry_models_with_counts:
            entry = InputEntry(
                id=entry_model.id,
                reception_number=entry_model.reception_number,
                entry_date=entry_model.entry_date,
                supplier=entry_model.supplier,
                total_cost=float(entry_model.total_cost),
                description=entry_model.description,
                created_at=entry_model.created_at,
                items=[],  # Vacío para listado
                _validate_items=False,  # Desactivar validación para listado
            )
            # Agregar atributos extra
            entry.item_count = item_count or 0
            entry.status = entry_model.status or 'active'
            entry.annulled_at = entry_model.annulled_at
            entry.annulment_reason = entry_model.annulment_reason
            entries.append(entry)
        
        return entries

    async def update(self, entry: InputEntry) -> InputEntry:
        # Buscar el modelo existente
        query = select(InputEntryModel).where(InputEntryModel.id == entry.id)
        result = await self.session.execute(query)
        entry_model = result.scalar_one_or_none()
        
        if not entry_model:
            raise ValueError(f"No se encontró la entrada con ID {entry.id}")
        
        # Actualizar campos
        if hasattr(entry, 'status'):
            entry_model.status = entry.status
        if hasattr(entry, 'annulled_at'):
            entry_model.annulled_at = entry.annulled_at
        if hasattr(entry, 'annulment_reason'):
            entry_model.annulment_reason = entry.annulment_reason
        
        await self.session.commit()
        await self.session.refresh(entry_model)
        
        # Actualizar entidad
        entry.updated_at = entry_model.updated_at
        
        return entry
