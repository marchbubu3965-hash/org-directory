from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.db.database import get_db
from app.models.organization import Organization
from app.models.log import OrganizationLog
from app.schemas.organization import (
    OrganizationCreate,
    OrganizationUpdate,
    OrganizationDelete,
    OrganizationResponse,
)
from app.schemas.log import LogResponse

router = APIRouter()

@router.get("/", response_model=List[OrganizationResponse])
def get_organizations(parent_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Organization).filter(Organization.deleted_at == None)
    if parent_id is not None:
        query = query.filter(Organization.parent_id == parent_id)
    else:
        query = query.filter(Organization.parent_id == None)
    return query.all()

@router.get("/{org_id}", response_model=OrganizationResponse)
def get_organization(org_id: int, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(
        Organization.id == org_id,
        Organization.deleted_at == None
    ).first()
    if not org:
        raise HTTPException(status_code=404, detail="找不到此單位")
    return org

@router.post("/", response_model=OrganizationResponse)
def create_organization(payload: OrganizationCreate, db: Session = Depends(get_db)):
    org = Organization(
        name=payload.name,
        parent_id=payload.parent_id,
        phone_auto=payload.phone_auto,
        phone_police=payload.phone_police,
        phone_railway=payload.phone_railway,
        phone_fax=payload.phone_fax,
        address=payload.address,
        note=payload.note,
    )
    db.add(org)
    db.flush()

    log = OrganizationLog(
        organization_id=org.id,
        action="create",
        changed_by=payload.changed_by,
    )
    db.add(log)
    db.commit()
    db.refresh(org)
    return org

@router.put("/{org_id}", response_model=OrganizationResponse)
def update_organization(org_id: int, payload: OrganizationUpdate, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(
        Organization.id == org_id,
        Organization.deleted_at == None
    ).first()
    if not org:
        raise HTTPException(status_code=404, detail="找不到此單位")

    fields = ["name", "parent_id", "phone_auto", "phone_police", "phone_railway", "phone_fax", "address", "note"]
    logs = []

    for field in fields:
        new_val = getattr(payload, field)
        if new_val is None:
            continue
        old_val = getattr(org, field)
        if str(old_val) != str(new_val):
            logs.append(OrganizationLog(
                organization_id=org.id,
                action="update",
                field_changed=field,
                old_value=str(old_val) if old_val is not None else None,
                new_value=str(new_val),
                changed_by=payload.changed_by,
            ))
            setattr(org, field, new_val)

    org.updated_at = datetime.now()
    db.add_all(logs)
    db.commit()
    db.refresh(org)
    return org

@router.delete("/{org_id}")
def delete_organization(org_id: int, payload: OrganizationDelete, db: Session = Depends(get_db)):
    org = db.query(Organization).filter(
        Organization.id == org_id,
        Organization.deleted_at == None
    ).first()
    if not org:
        raise HTTPException(status_code=404, detail="找不到此單位")

    org.deleted_at = datetime.now()

    log = OrganizationLog(
        organization_id=org.id,
        action="delete",
        changed_by=payload.changed_by,
    )
    db.add(log)
    db.commit()
    return {"success": True, "message": "已刪除"}

@router.get("/{org_id}/logs", response_model=List[LogResponse])
def get_logs(org_id: int, db: Session = Depends(get_db)):
    logs = db.query(OrganizationLog).filter(
        OrganizationLog.organization_id == org_id
    ).order_by(OrganizationLog.changed_at.desc()).all()
    return logs
