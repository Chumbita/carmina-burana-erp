from typing import Protocol

from src.domain.entities.supplier import Supplier


class ISupplierRepository(Protocol):

    async def add(self, supplier: Supplier) -> Supplier:
        """Persiste un nuevo proveedor y retorna la entidad con id asignado."""
        ...

    async def find_by_name(self, name: str) -> Supplier | None:
        """Busca un proveedor por nombre exacto. Retorna None si no existe."""
        ...

    async def find_by_id(self, supplier_id: int) -> Supplier | None:
        """Busca un proveedor por id. Retorna None si no existe."""
        ...

    async def find_all(
        self,
        offset: int | None = None,
        limit: int | None = None,
        q: str | None = None,
        status: str | None = None,
    ) -> tuple[list[Supplier], int]:
        """Retorna proveedores paginados y filtrados (q, status) ordenados por id."""
        ...

    async def find_active(self) -> list[Supplier]:
        """Retorna proveedores activos ordenados por nombre."""
        ...

    async def save(self, supplier: Supplier) -> Supplier | None:
        """Persiste cambios de un proveedor existente."""
        ...
