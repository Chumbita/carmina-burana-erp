from typing import Optional, List
from datetime import date

from src.domain.repositories.input_entry_repository import InputEntryRepositoryInterface
from src.domain.entities.input_entry import InputEntry


class ListInputEntries:
    def __init__(self, input_entry_repository: InputEntryRepositoryInterface):
        self.input_entry_repository = input_entry_repository

    async def execute(
        self,
        entry_date_from: Optional[date] = None,
        entry_date_to: Optional[date] = None,
        supplier: Optional[str] = None,
        page: int = 1,
        limit: int = 15
    ) -> dict:
        """
        Lista input entries con filtros y paginación
        """
        filters = {}
        if entry_date_from:
            filters['entry_date_from'] = entry_date_from
        if entry_date_to:
            filters['entry_date_to'] = entry_date_to
        if supplier:
            filters['supplier'] = supplier

        # Obtener datos del repositorio
        entries = await self.input_entry_repository.find_all(filters)
        
        # Calcular paginación
        total_count = len(entries)
        total_pages = (total_count + limit - 1) // limit
        start_index = (page - 1) * limit
        end_index = start_index + limit
        
        paginated_entries = entries[start_index:end_index]
        
        # Convertir a response format
        items = []
        for entry in paginated_entries:
            items.append({
                'id': entry.id,
                'reception_number': entry.reception_number,
                'entry_date': entry.entry_date,
                'supplier': entry.supplier,
                'total_cost': entry.total_cost,
                'description': entry.description,
                'created_at': entry.created_at,
                'item_count': getattr(entry, 'item_count', 0),  # Usar el conteo del repositorio
                'status': getattr(entry, 'status', 'active'),
            })

        return {
            'items': items,
            'total_count': total_count,
            'current_page': page,
            'total_pages': total_pages
        }
