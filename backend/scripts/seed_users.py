"""
Seed de usuarios para desarrollo.

Inserta un usuario admin por defecto.

Uso: python -m scripts.seed_users
"""

import asyncio

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.infrastructure.database.session import AsyncSessionLocal
from src.infrastructure.database.models.user_model import UserModel
from src.infrastructure.security.password_hasher import Argon2PasswordHasher


SEED_USERS = [
    {
        "username": "admin",
        "full_name": "Administrador",
        "plain_password": "123456",
        "role": "admin",
    },
]


async def seed() -> None:
    hasher = Argon2PasswordHasher()
    session: AsyncSession
    async with AsyncSessionLocal() as session:
        for u in SEED_USERS:
            existing = await session.execute(
                select(UserModel).where(UserModel.username == u["username"])
            )
            if existing.scalar_one_or_none():
                print(f"  SKIP user: {u['username']} (already exists)")
                continue

            hashed = hasher.hash_password(u["plain_password"])
            user = UserModel(
                username=u["username"],
                full_name=u["full_name"],
                password=hashed,
                role=u["role"],
                is_active=True,
            )
            session.add(user)
            await session.flush()
            print(f"  OK user: {u['username']} (id={user.id})")

        await session.commit()
        print("\n✅ Seed de usuarios completado.")


if __name__ == "__main__":
    asyncio.run(seed())
