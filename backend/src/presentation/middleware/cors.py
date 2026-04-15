from fastapi.middleware.cors import CORSMiddleware
from src.infrastructure.config import settings

""" Configuración del middleware CORS """

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Temporalmente permitir todos los orígenes
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )