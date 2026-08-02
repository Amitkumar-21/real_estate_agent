from sqlalchemy.orm import Session
from app.models.lead import Lead


def get_lead_by_session(db: Session, session_id: str):
    return db.query(Lead).filter(Lead.session_id == session_id).first()


def create_lead(db: Session, lead_data: dict):
    lead = Lead(**lead_data)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def update_lead(db: Session, lead: Lead, lead_data: dict):

    for key, value in lead_data.items():

        if value != "":
            setattr(lead, key, value)

    db.commit()
    db.refresh(lead)

    return lead