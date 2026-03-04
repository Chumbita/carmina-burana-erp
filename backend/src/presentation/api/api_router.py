from fastapi import APIRouter

api_router = APIRouter()

# ======================
# HEALH CHECK ROUTER
# ======================
from src.presentation.api.routes import health_router
api_router.include_router(health_router)

# ======================
# AUTH ROUTER
# ======================
from src.presentation.api.routes import auth_router
api_router.include_router(auth_router)

# ======================
# USERS ROUTER
# ======================
from src.presentation.api.routes import users_router
api_router.include_router(users_router)

# ======================
# INPUTS ROUTER
# ======================
from src.presentation.api.routes import input_router
api_router.include_router(input_router)
