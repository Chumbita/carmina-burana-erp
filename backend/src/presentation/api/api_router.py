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
# SUPPLY ROUTER
# ======================
from src.presentation.api.routes.supply_router import router as supply_router
api_router.include_router(supply_router)

# ======================
# SUPPLY ENTRIES ROUTER
# ======================
from src.presentation.api.routes.supply_entry_router import router as supply_entry_router
api_router.include_router(supply_entry_router)

# ======================
# SUPPLIER ROUTER
# ======================
from src.presentation.api.routes.supplier_router import router as supplier_router
api_router.include_router(supplier_router)

# ======================
# BOM ROUTER
# ======================
from src.presentation.api.routes.bom_router import router as bom_router
api_router.include_router(bom_router)

# ======================
# AUDIT LOGS ROUTER
# ======================
from src.presentation.api.routes import audit_logs_router
api_router.include_router(audit_logs_router)

# ======================
# UOM ROUTER
# ======================
from src.presentation.api.routes.uom_router import uom_router
api_router.include_router(uom_router)

# ======================
# BRAND ROUTER
# ======================
from src.presentation.api.routes.brand_router import brand_router
api_router.include_router(brand_router)

# ════════════════════════
# ITEM ROUTER
# ════════════════════════
from src.presentation.api.routes.item_router import item_router
api_router.include_router(item_router)
