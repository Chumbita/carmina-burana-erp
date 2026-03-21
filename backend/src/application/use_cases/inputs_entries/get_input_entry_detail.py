from src.domain.repositories.input_entry_repository import InputEntryRepositoryInterface
from src.domain.exceptions.input_entry_exceptions import SupplyEntryNotFound


class GetInputEntryDetail:
    def __init__(self, input_entry_repository: InputEntryRepositoryInterface):
        self.input_entry_repository = input_entry_repository

    async def execute(self, entry_id: int) -> dict:
        """
        Obtiene el detalle completo de un input entry con sus items
        """
        entry = await self.input_entry_repository.find_by_id(entry_id)
        
        if not entry:
            raise SupplyEntryNotFound(f"Input entry with id {entry_id} not found")

        # Convertir a response format con items completos
        items = []
        for item in entry.items or []:
            item_data = {
                'id': item.id,
                'id_input': item.id_input,
                'amount': item.amount,
                'unit_cost': item.unit_cost,
                'expire_date': item.expire_date,
                'comment': item.comment,
                'input_name': item.input_name,
            }
            
            # Agregar información del batch si existe
            if item.batch:
                item_data['batch'] = {
                    'id': item.batch.id,
                    'initial_amount': item.batch.initial_amount,
                    'current_amount': item.batch.current_amount,
                    'expire_date': item.batch.expire_date,
                }
            
            items.append(item_data)

        return {
            'id': entry.id,
            'reception_number': entry.reception_number,
            'entry_date': entry.entry_date,
            'supplier': entry.supplier,
            'total_cost': entry.total_cost,
            'description': entry.description,
            'created_at': entry.created_at,
            'status': getattr(entry, 'status', 'active'),
            'annulled_at': getattr(entry, 'annulled_at', None),
            'annulment_reason': getattr(entry, 'annulment_reason', None),
            'items': items
        }
