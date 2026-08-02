from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class CallSummary(Base):
    __tablename__ = "call_summaries"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True)
    summary = Column(String)
    next_action = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)