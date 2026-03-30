from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models.organization import Organization
from app.schemas.organization import OrganizationResponse

router = APIRouter()

def get_full_path(org: Organization, db: Session) -> str:
    path = [org.name]
    current = org
    while current.parent_id is not None:
        parent = db.query(Organization).filter(
            Organization.id == current.parent_id,
            Organization.deleted_at == None
        ).first()
        if not parent:
            break
        path.insert(0, parent.name)
        current = parent
    return " / ".join(path)

@router.get("/")
def search(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    keyword = f"%{q}%"

    results = db.query(Organization).filter(
        Organization.deleted_at == None,
        (
            Organization.name.ilike(keyword) |
            Organization.phone_auto.ilike(keyword) |
            Organization.phone_police.ilike(keyword) |
            Organization.phone_railway.ilike(keyword) |
            Organization.phone_fax.ilike(keyword) |
            Organization.note.ilike(keyword)
        )
    ).offset(offset).limit(limit).all()

    return {
        "success": True,
        "total": len(results),
        "data": [
            {
                "id": org.id,
                "name": org.name,
                "path": get_full_path(org, db),
                "phone_auto": org.phone_auto,
                "phone_police": org.phone_police,
                "phone_railway": org.phone_railway,
                "phone_fax": org.phone_fax,
                "address": org.address,
                "note": org.note,
            }
            for org in results
        ]
    }
