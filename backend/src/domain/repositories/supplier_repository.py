from typing import Protocol

from src.domain.entities.supplier import Supplier


class ISupplierRepository(Protocol):

    async def add(self, supplier: Supplier) -> Supplier:
        """Persiste un nuevo proveedor y retorna la entidad con id asignado."""
        ...

    async def find_by_name(self, name: str) -> Supplier | None:
        """Busca un proveedor por nombre exacto. Retorna None si no existe."""
        ...
