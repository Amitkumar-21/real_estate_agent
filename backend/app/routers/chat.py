from fastapi import APIRouter
from pydantic import BaseModel
from app.services.llm import generate_response


router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    message: str

@router.post("/chat")
def chat(request: ChatRequest):
    reply = generate_response(request.session_id, request.message)
    return {"reply": reply}