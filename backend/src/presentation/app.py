from fastapi import FastAPI
from src.presentation.middleware import setup_cors
from src.presentation.api.routers import health_router
from src.presentation.api.routers import auth_router
from src.presentation.api.routers import input_router

def create_app():
    app = FastAPI()
    
    """ Middleware Setup """
    setup_cors(app)
    
    """ Routes """
    # Auth routes
    app.include_router(auth_router)

    # Input routes
    app.include_router(input_router)
    
    """ Healthcheck Route """
    app.include_router(health_router)

    
    return app