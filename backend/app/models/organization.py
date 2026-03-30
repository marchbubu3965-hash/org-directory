from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey("organizations.id"), nullable=True, index=True)
    phone_auto = Column(String, nullable=True, index=True)
    phone_police = Column(String, nullable=True, index=True)
    phone_railway = Column(String, nullable=True, index=True)
    phone_fax = Column(String, nullable=True, index=True)
    address = Column(String, nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    children = relationship("Organization", backref="parent", foreign_keys=[parent_id])
    logs = relationship("OrganizationLog", back_populates="organization")
