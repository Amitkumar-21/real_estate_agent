from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String
from app.database import Base


class Conversation(Base):
    __tablename__ = "conversations"
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    role = Column(String)
    message = Column(String)    
    created_at = Column(DateTime, default=datetime.utcnow)