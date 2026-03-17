from fastapi import FastAPI
from src.presentation.middleware import setup_cors
from src.presentation.api.api_router import api_router
from src.presentation.routers.audit_logs_router import router as audit_logs_router

def create_app():
    app = FastAPI()
    
    """ Middleware Setup """
    setup_cors(app)
    
    """ Api Router """
    app.include_router(api_router)
    
    """ Audit logs routes """
    app.include_router(audit_logs_router)
    
    return app