from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.ext.asyncio import AsyncSession


async def paginate(
    session: AsyncSession,
    stmt: Select,
    *,
    offset: int,
    limit: int,
) -> tuple[list[Any], int]:
    """Aplica offset/limit a un select y devuelve (filas, total).

    El total se calcula sobre una subquery del mismo statement, por lo que
    refleja exactamente los mismos joins y filtros de la query de datos.
    """
    count_stmt = select(func.count()).select_from(stmt.order_by(None).subquery())
    total = await session.scalar(count_stmt) or 0
    result = await session.execute(stmt.offset(offset).limit(limit))
    return result.all(), total
