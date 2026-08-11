from datetime import datetime

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.dtos.notifications.notification_dtos import UserNotificationState
from src.infrastructure.database.models.user_notification_state_model import UserNotificationStateModel


class UserNotificationStateRepository:
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_user_and_keys(
        self,
        user_id: int,
        notification_keys: list[str],
    ) -> dict[str, UserNotificationState]:
        if not notification_keys:
            return {}

        result = await self._session.execute(
            select(UserNotificationStateModel).where(
                UserNotificationStateModel.user_id == user_id,
                UserNotificationStateModel.notification_key.in_(notification_keys),
            )
        )

        return {
            model.notification_key: UserNotificationState(
                notification_key=model.notification_key,
                read_at=model.read_at,
                dismissed_at=model.dismissed_at,
            )
            for model in result.scalars().all()
        }

    async def mark_read(self, user_id: int, notification_key: str, read_at: datetime) -> None:
        model = await self._get_or_create(user_id, notification_key)
        model.read_at = model.read_at or read_at
        await self._session.flush()

    async def mark_all_read(self, user_id: int, notification_keys: list[str], read_at: datetime) -> None:
        for notification_key in notification_keys:
            await self.mark_read(user_id, notification_key, read_at)

    async def dismiss(self, user_id: int, notification_key: str, dismissed_at: datetime) -> None:
        model = await self._get_or_create(user_id, notification_key)
        model.dismissed_at = dismissed_at
        await self._session.flush()

    async def delete_inactive(self, user_id: int, active_keys: list[str]) -> None:
        stmt = delete(UserNotificationStateModel).where(UserNotificationStateModel.user_id == user_id)
        if active_keys:
            stmt = stmt.where(UserNotificationStateModel.notification_key.notin_(active_keys))
        await self._session.execute(stmt)
        await self._session.flush()

    async def _get_or_create(self, user_id: int, notification_key: str) -> UserNotificationStateModel:
        result = await self._session.execute(
            select(UserNotificationStateModel).where(
                UserNotificationStateModel.user_id == user_id,
                UserNotificationStateModel.notification_key == notification_key,
            )
        )
        model = result.scalar_one_or_none()
        if model is not None:
            return model

        model = UserNotificationStateModel(user_id=user_id, notification_key=notification_key)
        self._session.add(model)
        await self._session.flush()
        return model
