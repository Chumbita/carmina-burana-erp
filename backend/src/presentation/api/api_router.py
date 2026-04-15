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

# ======================
# INPUT ENTRIES ROUTER
# ======================
from src.presentation.api.routes import input_entry_router
api_router.include_router(input_entry_router)

# ======================
# SUPPLY ROUTER
# ======================
from src.presentation.api.routes.supply_router import router as supply_router
api_router.include_router(supply_router)

# ======================
# AUDIT LOGS ROUTER
# ======================
# TODO: Descomentar cuando la tabla audit_logs exista en la BD
# from src.presentation.api.routes import audit_logs_router
# api_router.include_router(audit_logs_router)