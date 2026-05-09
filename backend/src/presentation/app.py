from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from src.presentation.middleware import setup_cors
from src.presentation.api.api_router import api_router
from src.presentation.routers.audit_logs_router import router as audit_logs_router
from sqlalchemy.exc import IntegrityError

from src.domain.exceptions.item_exceptions import (
    ItemNotFoundException,
    ItemAlreadyDeletedException,
    SpecializedItemUpdateException,
)
from src.domain.exceptions.supply_exceptions import SupplyNotFoundException


def create_app():
    app = FastAPI()
    
    """ Exception Handlers """
    @app.exception_handler(ItemNotFoundException)
    async def item_not_found_handler(request: Request, exc: ItemNotFoundException):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ItemAlreadyDeletedException)
    async def item_deleted_handler(request: Request, exc: ItemAlreadyDeletedException):
        return JSONResponse(status_code=400, content={"detail": str(exc)})

    @app.exception_handler(SpecializedItemUpdateException)
    async def specialized_update_handler(request: Request, exc: SpecializedItemUpdateException):
        return JSONResponse(status_code=422, content={"detail": str(exc)})

    @app.exception_handler(SupplyNotFoundException)
    async def supply_not_found_handler(request: Request, exc: SupplyNotFoundException):
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(status_code=422, content={"detail": str(exc)})
    
    @app.exception_handler(IntegrityError) 
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        """
        Maneja errores de integridad de la base de datos, como claves foráneas no existentes.
        """
        return JSONResponse(
            status_code=400, 
            content={"detail": "One or more referenced values do not exist."}
    )
    
    """ Middleware Setup """
    setup_cors(app)
    
    """ Api Router """
    app.include_router(api_router)
    
    """ Audit logs routes """
    app.include_router(audit_logs_router)
    
    return app