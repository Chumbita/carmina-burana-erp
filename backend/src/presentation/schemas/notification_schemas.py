from datetime import datetime

from pydantic import BaseModel


class NotificationResponseSchema(BaseModel):
    key: str
    type: str
    title: str
    message: str
    href: str | None
    read: bool
    created_at: datetime
