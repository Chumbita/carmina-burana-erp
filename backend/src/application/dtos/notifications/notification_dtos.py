from dataclasses import dataclass
from datetime import datetime


@dataclass(frozen=True)
class GeneratedNotification:
    key: str
    type: str
    title: str
    message: str
    href: str | None
    created_at: datetime


@dataclass(frozen=True)
class UserNotificationState:
    notification_key: str
    read_at: datetime | None
    dismissed_at: datetime | None


@dataclass(frozen=True)
class NotificationResponse:
    key: str
    type: str
    title: str
    message: str
    href: str | None
    read: bool
    created_at: datetime
