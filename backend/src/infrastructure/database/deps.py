from .session import AsyncSessionLocal

# Dependencia para inyectar session en endpoints FastAPI
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except:
            await session.rollback()
            raise
        finally:
            await session.close()