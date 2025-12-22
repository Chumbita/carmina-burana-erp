from fastapi.middleware.cors import CORSMiddleware
from src.infrastructure.config import settings

""" Configuración del middleware CORS """

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )