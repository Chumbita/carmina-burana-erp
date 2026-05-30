from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from src.domain.exceptions.item_exceptions import (
    ItemNotFoundException,
    ItemAlreadyDeletedException
)
from src.domain.exceptions.supply_exceptions import SupplyNotFoundException
from src.domain.exceptions.inventory_exceptions import DuplicateLotCodeError
from src.domain.exceptions.supply_entry_exceptions import SupplyEntryNotFound
from src.domain.exceptions.supplier_exceptions import DuplicateSupplierNameError


def register_exception_handlers(app: FastAPI) -> None:

    """ 
    Registro centralizado de exception handlers para la aplicación.
    Cada vez que se agregue un nuevo módulo con sus propias excepciones de dominio,
    registrar los handlers correspondientes en este archivo agrupados por módulo.
    """
        
    # ======================
    # GENERIC EXCEPTIONS
    # ======================

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        return JSONResponse(status_code=400, content={"detail": "One or more referenced values do not exist."})

    # ======================
    # ITEM EXCEPTIONS
    # ======================
    @app.exception_handler(ItemNotFoundException)
    async def item_not_found_handler(request: Request, exc: ItemNotFoundException):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ItemAlreadyDeletedException)
    async def item_deleted_handler(request: Request, exc: ItemAlreadyDeletedException):
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    # ======================
    # SUPPLY EXCEPTIONS
    # ======================
    @app.exception_handler(SupplyNotFoundException)
    async def supply_not_found_handler(request: Request, exc: SupplyNotFoundException):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    # ======================
    # SUPPLY ENTRY EXCEPTIONS
    # ======================
    @app.exception_handler(SupplyEntryNotFound)
    async def supply_entry_not_found_handler(request: Request, exc: SupplyEntryNotFound):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    # ======================
    # SUPPLIER EXCEPTIONS
    # ======================
    @app.exception_handler(DuplicateSupplierNameError)
    async def duplicate_supplier_name_handler(request: Request, exc: DuplicateSupplierNameError):
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    # ======================
    # INVENTORY EXCEPTIONS
    # ======================
    @app.exception_handler(DuplicateLotCodeError)
    async def duplicate_lot_code_handler(request: Request, exc: DuplicateLotCodeError):
        return JSONResponse(status_code=409, content={"detail": str(exc)})