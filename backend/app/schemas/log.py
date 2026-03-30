from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LogResponse(BaseModel):
    id: int
    organization_id: int
    action: str
    field_changed: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    changed_by: str
    changed_at: datetime

    class Config:
        from_attributes = True
