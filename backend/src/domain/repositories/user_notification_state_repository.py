from datetime import datetime
from typing import Protocol

from src.application.dtos.notifications.notification_dtos import UserNotificationState


class IUserNotificationStateRepository(Protocol):
    async def find_by_user_and_keys(
        self,
        user_id: int,
        notification_keys: list[str],
    ) -> dict[str, UserNotificationState]:
        ...

    async def mark_read(self, user_id: int, notification_key: str, read_at: datetime) -> None:
        ...

    async def mark_all_read(self, user_id: int, notification_keys: list[str], read_at: datetime) -> None:
        ...

    async def dismiss(self, user_id: int, notification_key: str, dismissed_at: datetime) -> None:
        ...

    async def delete_inactive(self, user_id: int, active_keys: list[str]) -> None:
        ...
