from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrganizationBase(BaseModel):
    name: str
    parent_id: Optional[int] = None
    phone_auto: Optional[str] = None
    phone_police: Optional[str] = None
    phone_railway: Optional[str] = None
    phone_fax: Optional[str] = None
    address: Optional[str] = None
    note: Optional[str] = None

class OrganizationCreate(OrganizationBase):
    changed_by: str

class OrganizationUpdate(OrganizationBase):
    name: Optional[str] = None
    changed_by: str

class OrganizationDelete(BaseModel):
    changed_by: str

class OrganizationResponse(OrganizationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True
