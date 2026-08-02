from app.repositories.lead_repository import (get_lead_by_session,create_lead,update_lead,)
from sqlalchemy.orm import Session

def save_lead(db: Session, lead_data: dict):
    session_id = lead_data.get("session_id")
    existing = get_lead_by_session(db, session_id)
    if existing:
        return update_lead(db, existing, lead_data)
    return create_lead(db, lead_data)