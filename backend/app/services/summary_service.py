from sqlalchemy.orm import Session
from app.repositories.summary_repository import (get_summary_by_session,create_summary,update_summary,)

def save_summary(db: Session, session_id: str, summary_data: dict):
    existing = get_summary_by_session(db, session_id)
    summary_data["session_id"] = session_id
    if existing:
        return update_summary(db, existing, summary_data)

    return create_summary(db, summary_data)