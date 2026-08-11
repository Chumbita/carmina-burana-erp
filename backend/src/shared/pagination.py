from dataclasses import dataclass
from math import ceil
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass(frozen=True)
class PaginationParams:
    """Parámetros de paginación ya normalizados (page_size con cap aplicado)."""

    page: int
    page_size: int

    @property
    def offset(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


def parse_pagination(page: int, page_size: int, max_page_size: int = 20) -> PaginationParams:
    """Normaliza page/page_size: página mínima 1, page_size mínimo 1 y cap al máximo."""
    page = max(1, page)
    page_size = min(max(1, page_size), max_page_size)
    return PaginationParams(page=page, page_size=page_size)


@dataclass
class Page(Generic[T]):
    """Página de resultados con metadata de paginación."""

    items: list[T]
    total_items: int
    params: PaginationParams

    @property
    def total_pages(self) -> int:
        return ceil(self.total_items / self.params.page_size) if self.total_items else 0
