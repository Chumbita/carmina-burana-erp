from fastapi import FastAPI
from src.application.middleware import setup_cors
from src.application.api.routers import health_router

def create_app():
    app = FastAPI()
    
    """ Middleware Setup """
    setup_cors(app)
    
    """ Routes """

    """ Healthcheck Route """
    app.include_router(health_router)
    
    return app