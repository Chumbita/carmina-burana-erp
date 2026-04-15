from fastapi import FastAPI
from src.presentation.middleware import setup_cors
from src.presentation.api.api_router import api_router

def create_app():
    app = FastAPI()
    
    """ Middleware Setup """
    setup_cors(app)
    
    """ Api Router """
    app.include_router(api_router)
    
    return app