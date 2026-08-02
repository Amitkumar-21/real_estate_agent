from sqlalchemy.orm import Session
from app.models.call_summary import CallSummary


def get_summary_by_session(db: Session, session_id: str):
    return (db.query(CallSummary).filter(CallSummary.session_id == session_id).first())



def create_summary(db: Session, summary_data: dict):
    summary = CallSummary(**summary_data)
    db.add(summary)
    db.commit()
    db.refresh(summary)

    return summary


def update_summary(db: Session,summary: CallSummary,summary_data: dict):
    summary.summary = summary_data["summary"]
    summary.next_action = summary_data["next_action"]
    db.commit()
    db.refresh(summary)

    return summary