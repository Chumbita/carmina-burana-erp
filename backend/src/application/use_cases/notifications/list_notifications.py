from typing import Protocol

from src.application.dtos.notifications.notification_dtos import (
    GeneratedNotification,
    NotificationResponse,
)
from src.domain.repositories.user_notification_state_repository import IUserNotificationStateRepository


class NotificationProvider(Protocol):
    async def list_notifications(self) -> list[GeneratedNotification]:
        ...


class ListNotificationsUseCase:
    def __init__(
        self,
        providers: list[NotificationProvider],
        state_repository: IUserNotificationStateRepository,
    ) -> None:
        self._providers = providers
        self._state_repository = state_repository

    async def execute(self, user_id: int) -> list[NotificationResponse]:
        generated = [
            notification
            for provider in self._providers
            for notification in await provider.list_notifications()
        ]
        active_keys = [notification.key for notification in generated]

        await self._state_repository.delete_inactive(user_id, active_keys)
        states = await self._state_repository.find_by_user_and_keys(user_id, active_keys)

        return [
            NotificationResponse(
                key=notification.key,
                type=notification.type,
                title=notification.title,
                message=notification.message,
                href=notification.href,
                read=states.get(notification.key).read_at is not None
                if states.get(notification.key)
                else False,
                created_at=notification.created_at,
            )
            for notification in sorted(generated, key=lambda item: item.created_at, reverse=True)
            if not states.get(notification.key) or states[notification.key].dismissed_at is None
        ]
