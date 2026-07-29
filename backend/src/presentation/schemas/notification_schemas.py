from pydantic import BaseModel


class NotificationResponse(BaseModel):
    id: str
    type: str
    title: str
    message: str
    time: str
    href: str | None = None
    read: bool = False
