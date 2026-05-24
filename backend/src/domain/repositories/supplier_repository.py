from typing import Protocol

from src.domain.entities.supplier import Supplier


class ISupplierRepository(Protocol):

    async def add(self, supplier: Supplier) -> Supplier:
        """Persiste un nuevo proveedor y retorna la entidad con id asignado."""
        ...
