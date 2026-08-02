from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)

    session_id = Column(String, unique=True, index=True)

    name = Column(String)
    phone = Column(String)
    email = Column(String)

    location = Column(String)
    property_type = Column(String)
    configuration = Column(String)

    budget = Column(String)
    purpose = Column(String)
    timeline = Column(String)

    interest_level = Column(String)

    notes = Column(String)

    created_at = Column(DateTime, default=datetime.utcnow)