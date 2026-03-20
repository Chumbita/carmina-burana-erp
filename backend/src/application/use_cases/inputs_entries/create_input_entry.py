from src.domain.entities.input_entry import InputEntry,InputEntryItem
from src.domain.repositories.input_entry_repository import InputEntryRepositoryInterface
from src.domain.repositories.input_repository import InputRepository
from dataclasses import dataclass
from datetime import date
from typing import Optional
import uuid

@dataclass
class InputEntryItemDTO:
    id_input: int
    amount: float
    unit_cost: float
    expire_date: date
    comment: Optional[str] = None

@dataclass
class RegisterInputEntryDTO:
    entry_date: date
    supplier: str
    total_cost: float
    items: list[InputEntryItemDTO]
    description: Optional[str] = None


class RegisterInputEntry:

    def __init__(
        self,
        input_entry_repo: InputEntryRepositoryInterface,
        input_repo: InputRepository,
    ):
        self.input_entry_repo = input_entry_repo
        self.input_repo = input_repo

    async def execute(self, dto: RegisterInputEntryDTO) -> InputEntry:
        
        #Lógica de negocio: Validar que todos los insumos existan 
        for item in dto.items:
            input = await self.input_repo.get_input_entity_by_id(item.id_input)
            if input is None:
                raise ValueError(f"El insumo con id {item.id_input} no existe")

        # Generar número de recepción único
        reception_number = f"REC-{dto.entry_date.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        
        # Crear entidad principal
        entry = InputEntry(
            entry_date=dto.entry_date,
            supplier=dto.supplier,
            total_cost=dto.total_cost,
            description=dto.description,
            reception_number=reception_number,
            items=[
                InputEntryItem(
                    id_entry=None,
                    id_input=item.id_input,
                    amount=item.amount,
                    unit_cost=item.unit_cost,
                    expire_date=item.expire_date,
                    comment=item.comment,
                )
                for item in dto.items
            ]
        )

        # Persistir todo
        return await self.input_entry_repo.save(entry)