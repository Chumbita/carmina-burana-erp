from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from src.presentation.middleware import setup_cors
from src.presentation.api.api_router import api_router
from src.presentation.routers.audit_logs_router import router as audit_logs_router
from src.presentation.exception_handlers.exception_handlers import register_exception_handlers


def create_app():
    app = FastAPI()
    
    """ Exception Handlers """
    register_exception_handlers(app)
    
    """ Middleware Setup """
    setup_cors(app)
    
    """ Api Router """
    app.include_router(api_router)
    
    """ Audit logs routes """
    app.include_router(audit_logs_router)
    
    return app