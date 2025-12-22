from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from src.infrastructure.database.deps import get_db

health_router = APIRouter(tags=["health"])

@health_router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Endpoint para verificar el estado del servidor y la base de datos.
    """
    try:
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception as e: 
        db_status = f"error: {str(e)}"
        
    return {
        "status": "ok",
        "database": db_status
    }