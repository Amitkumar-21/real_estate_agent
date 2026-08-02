from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.summary import generate_summary
from app.services.summary_service import save_summary

router = APIRouter()

class SummaryRequest(BaseModel):
    session_id: str


@router.post("/end-conversation")
def end_conversation(request: SummaryRequest,db: Session = Depends(get_db)):
    summary = generate_summary(db, request.session_id)
    if "error" not in summary:
        save_summary(db, request.session_id, summary)
    return summary