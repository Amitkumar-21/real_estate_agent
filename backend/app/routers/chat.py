from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.extractor import extract_lead
from app.services.lead_service import save_lead
from pydantic import BaseModel
from app.services.llm import generate_response


router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    message: str

@router.post("/chat")
def chat(request: ChatRequest,db: Session = Depends(get_db)):
    reply = generate_response(db,request.session_id, request.message)
    lead = extract_lead(db, request.session_id)
    save_lead(db, lead)
    return {"reply": reply}