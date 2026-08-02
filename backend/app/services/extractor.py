import json
from groq import Groq
from app.config import GROQ_API_KEY, MODEL_NAME
from app.services.prompts import LEAD_EXTRACTION_PROMPT
from sqlalchemy.orm import Session
from app.repositories.conversation_repository import get_history

client = Groq(api_key=GROQ_API_KEY)


def extract_lead(db: Session, session_id: str):
    history = get_history(db, session_id)
    conversation = ""

    for message in history:
        conversation += f"{message.role}: {message.message}\n"

    messages = [
    {
        "role": "system",
        "content": LEAD_EXTRACTION_PROMPT
    },
    {
        "role": "user",
        "content": conversation
    }
    ]
    response = client.chat.completions.create(model=MODEL_NAME,messages=messages,temperature=0)
    result = response.choices[0].message.content
    try:
        lead=json.loads(result)
        lead["session_id"] = session_id
        return lead
    except json.JSONDecodeError:
        return{"error":"Failed to extract lead.","raw_response":result}