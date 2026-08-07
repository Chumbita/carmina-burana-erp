from fastapi import APIRouter, Depends, Path, status

from src.application.use_cases.notifications.list_notifications import ListNotificationsUseCase
from src.application.use_cases.notifications.update_notification_state import (
    DismissNotificationUseCase,
    MarkAllNotificationsReadUseCase,
    MarkNotificationReadUseCase,
)
from src.domain.entities.user import User
from src.presentation.dependencies.auth import get_current_user
from src.presentation.dependencies.use_cases.notifications import (
    get_dismiss_notification_use_case,
    get_list_notifications_use_case,
    get_mark_all_notifications_read_use_case,
    get_mark_notification_read_use_case,
)
from src.presentation.schemas.notification_schemas import NotificationResponseSchema


router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=list[NotificationResponseSchema], summary="Listar notificaciones")
async def list_notifications(
    use_case: ListNotificationsUseCase = Depends(get_list_notifications_use_case),
    current_user: User = Depends(get_current_user),
) -> list:
    return await use_case.execute(current_user.id)


@router.patch("/{notification_key}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_notification_read(
    notification_key: str = Path(..., min_length=1, max_length=160),
    use_case: MarkNotificationReadUseCase = Depends(get_mark_notification_read_use_case),
    current_user: User = Depends(get_current_user),
) -> None:
    await use_case.execute(current_user.id, notification_key)


@router.patch("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read(
    list_use_case: ListNotificationsUseCase = Depends(get_list_notifications_use_case),
    mark_use_case: MarkAllNotificationsReadUseCase = Depends(get_mark_all_notifications_read_use_case),
    current_user: User = Depends(get_current_user),
) -> None:
    notifications = await list_use_case.execute(current_user.id)
    await mark_use_case.execute(current_user.id, [notification.key for notification in notifications])


@router.patch("/{notification_key}/dismiss", status_code=status.HTTP_204_NO_CONTENT)
async def dismiss_notification(
    notification_key: str = Path(..., min_length=1, max_length=160),
    use_case: DismissNotificationUseCase = Depends(get_dismiss_notification_use_case),
    current_user: User = Depends(get_current_user),
) -> None:
    await use_case.execute(current_user.id, notification_key)
