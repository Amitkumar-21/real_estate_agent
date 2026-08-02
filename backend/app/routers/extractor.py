from fastapi import APIRouter
from pydantic import BaseModel
from app.services.extractor import extract_lead

router = APIRouter()

class LeadRequest(BaseModel):
    session_id: str

@router.post("/extract-lead")
def extract(request: LeadRequest):
    lead = extract_lead(request.session_id)
    return lead