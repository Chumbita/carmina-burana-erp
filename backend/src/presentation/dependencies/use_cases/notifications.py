from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.application.use_cases.notifications.inventory_notification_provider import InventoryNotificationProvider
from src.application.use_cases.notifications.list_notifications import ListNotificationsUseCase
from src.application.use_cases.notifications.update_notification_state import (
    DismissNotificationUseCase,
    MarkAllNotificationsReadUseCase,
    MarkNotificationReadUseCase,
)
from src.infrastructure.database.deps import get_db
from src.infrastructure.database.repositories.supply_repository import SupplyRepository
from src.infrastructure.database.repositories.user_notification_state_repository import (
    UserNotificationStateRepository,
)


def get_user_notification_state_repository(
    session: AsyncSession = Depends(get_db),
) -> UserNotificationStateRepository:
    return UserNotificationStateRepository(session)


def get_list_notifications_use_case(
    session: AsyncSession = Depends(get_db),
    state_repository: UserNotificationStateRepository = Depends(get_user_notification_state_repository),
) -> ListNotificationsUseCase:
    inventory_provider = InventoryNotificationProvider(SupplyRepository(session))
    return ListNotificationsUseCase([inventory_provider], state_repository)


def get_mark_notification_read_use_case(
    state_repository: UserNotificationStateRepository = Depends(get_user_notification_state_repository),
) -> MarkNotificationReadUseCase:
    return MarkNotificationReadUseCase(state_repository)


def get_mark_all_notifications_read_use_case(
    state_repository: UserNotificationStateRepository = Depends(get_user_notification_state_repository),
) -> MarkAllNotificationsReadUseCase:
    return MarkAllNotificationsReadUseCase(state_repository)


def get_dismiss_notification_use_case(
    state_repository: UserNotificationStateRepository = Depends(get_user_notification_state_repository),
) -> DismissNotificationUseCase:
    return DismissNotificationUseCase(state_repository)
