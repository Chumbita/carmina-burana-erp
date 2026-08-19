from datetime import datetime

import pytest

from src.application.dtos.notifications.notification_dtos import (
    GeneratedNotification,
    UserNotificationState,
)
from src.application.use_cases.notifications.list_notifications import ListNotificationsUseCase


class FakeProvider:
    def __init__(self, notifications: list[GeneratedNotification]) -> None:
        self._notifications = notifications

    async def list_notifications(self) -> list[GeneratedNotification]:
        return self._notifications


class FakeStateRepository:
    def __init__(self) -> None:
        self.states = {
            "inventory.low-stock:1": UserNotificationState(
                notification_key="inventory.low-stock:1",
                read_at=datetime(2026, 7, 29, 12, 0, 0),
                dismissed_at=None,
            ),
            "inventory.expiring-lot:9": UserNotificationState(
                notification_key="inventory.expiring-lot:9",
                read_at=None,
                dismissed_at=datetime(2026, 7, 29, 13, 0, 0),
            ),
        }
        self.cleaned_keys = None

    async def find_by_user_and_keys(
        self,
        user_id: int,
        notification_keys: list[str],
    ) -> dict[str, UserNotificationState]:
        return {
            key: state
            for key, state in self.states.items()
            if key in notification_keys
        }

    async def delete_inactive(self, user_id: int, active_keys: list[str]) -> None:
        self.cleaned_keys = active_keys


@pytest.mark.asyncio
async def test_list_notifications_merges_user_state_and_hides_dismissed():
    active_notifications = [
        GeneratedNotification(
            key="inventory.low-stock:1",
            type="warning",
            title="Stock bajo",
            message="Malta está por debajo del mínimo.",
            href="/inventario/insumos/1",
            created_at=datetime(2026, 7, 29, 10, 0, 0),
        ),
        GeneratedNotification(
            key="inventory.expiring-lot:9",
            type="alert",
            title="Lote próximo a vencer",
            message="Levadura vence pronto.",
            href="/inventario/insumos/2",
            created_at=datetime(2026, 7, 29, 11, 0, 0),
        ),
        GeneratedNotification(
            key="inventory.low-stock:3",
            type="warning",
            title="Stock bajo",
            message="Lúpulo está por debajo del mínimo.",
            href="/inventario/insumos/3",
            created_at=datetime(2026, 7, 29, 9, 0, 0),
        ),
    ]
    state_repository = FakeStateRepository()
    use_case = ListNotificationsUseCase([FakeProvider(active_notifications)], state_repository)

    result = await use_case.execute(user_id=7)

    assert [notification.key for notification in result] == [
        "inventory.low-stock:1",
        "inventory.low-stock:3",
    ]
    assert [notification.read for notification in result] == [True, False]
    assert state_repository.cleaned_keys == [
        "inventory.low-stock:1",
        "inventory.expiring-lot:9",
        "inventory.low-stock:3",
    ]
