from datetime import datetime, timezone

from src.domain.repositories.user_notification_state_repository import IUserNotificationStateRepository


class MarkNotificationReadUseCase:
    def __init__(self, state_repository: IUserNotificationStateRepository) -> None:
        self._state_repository = state_repository

    async def execute(self, user_id: int, notification_key: str) -> None:
        await self._state_repository.mark_read(user_id, notification_key, datetime.now(timezone.utc))


class MarkAllNotificationsReadUseCase:
    def __init__(self, state_repository: IUserNotificationStateRepository) -> None:
        self._state_repository = state_repository

    async def execute(self, user_id: int, notification_keys: list[str]) -> None:
        await self._state_repository.mark_all_read(user_id, notification_keys, datetime.now(timezone.utc))


class DismissNotificationUseCase:
    def __init__(self, state_repository: IUserNotificationStateRepository) -> None:
        self._state_repository = state_repository

    async def execute(self, user_id: int, notification_key: str) -> None:
        await self._state_repository.dismiss(user_id, notification_key, datetime.now(timezone.utc))
