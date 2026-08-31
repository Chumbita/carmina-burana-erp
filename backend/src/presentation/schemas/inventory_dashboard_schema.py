from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class InventoryDashboardSummaryResponse(BaseModel):
    active: int
    out_of_stock: int
    critical: int
    low: int
    optimal: int
    packaging: int
    production: int


class StockByStatusResponse(BaseModel):
    status: str
    count: int


class StockByCategoryResponse(BaseModel):
    category: str
    stock_total: Decimal


class TopLowStockResponse(BaseModel):
    id: int
    item_id: int
    item_name: str
    stock_total: Decimal
    min_stock_level: Decimal
    coverage: Decimal
    status: str
    uom_symbol: str


class ExpiringLotResponse(BaseModel):
    id: int
    lot_id: int
    item_id: int
    item_name: str
    lot_code: str
    expiration_date: datetime
    quantity: Decimal
    uom_symbol: str


class RecentEntryResponse(BaseModel):
    id: int
    document_number: Optional[str] = None
    supplier_name: Optional[str] = None
    entry_date: datetime
    status: str
    items_count: int
    total_cost: Decimal


class InventoryDashboardResponse(BaseModel):
    summary: InventoryDashboardSummaryResponse
    stock_by_status: list[StockByStatusResponse]
    stock_by_category: list[StockByCategoryResponse]
    top_low_stock: list[TopLowStockResponse]
    expiring_lots: list[ExpiringLotResponse]
    recent_entries: list[RecentEntryResponse]
