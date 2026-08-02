import json
from groq import Groq
from sqlalchemy.orm import Session
from app.config import GROQ_API_KEY, MODEL_NAME
from app.repositories.conversation_repository import get_history
from app.services.prompts import CALL_SUMMARY_PROMPT

client = Groq(api_key=GROQ_API_KEY)

def generate_summary(db: Session, session_id: str):
    history = get_history(db, session_id)
    conversation = ""
    for message in history:
        conversation += f"{message.role}: {message.message}\n"
    messages = [
        {
            "role": "system",
            "content": CALL_SUMMARY_PROMPT
        },
        {
            "role": "user",
            "content": conversation
        }
    ]
    response = client.chat.completions.create(model=MODEL_NAME,messages=messages,temperature=0)
    result = response.choices[0].message.content
    try:
        return json.loads(result)

    except json.JSONDecodeError:
        return {
            "error": "Failed to generate summary",
            "raw_response": result
        }