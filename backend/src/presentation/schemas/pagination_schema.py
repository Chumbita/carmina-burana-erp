from typing import Generic, TypeVar

from pydantic import BaseModel

from src.shared.pagination import Page

T = TypeVar("T")


class PaginationMetadata(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    pagination: PaginationMetadata

    @classmethod
    def from_page(cls, page: Page[T]) -> "PaginatedResponse[T]":
        return cls(
            data=page.items,
            pagination=PaginationMetadata(
                page=page.params.page,
                page_size=page.params.page_size,
                total_items=page.total_items,
                total_pages=page.total_pages,
            ),
        )
