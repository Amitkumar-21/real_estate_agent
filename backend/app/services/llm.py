from groq import Groq
from app.config import GROQ_API_KEY, MODEL_NAME
from app.services.prompts import SYSTEM_PROMPT
from app.services.knowledge import get_project_info
from sqlalchemy.orm import Session
from app.repositories.conversation_repository import (get_history,save_message)

client = Groq(api_key=GROQ_API_KEY)

import os



def generate_response(db: Session,session_id: str, message: str) -> str:
    project = get_project_info()

    system_prompt = f"""
{SYSTEM_PROMPT}

Project Information:

{project}
"""

    # Get previous conversation
    history = get_history(db,session_id)

    # Build messages for the LLM
    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    # Add previous conversation
    for msg in history:
        messages.append(
            {
                "role": msg.role,
                "content": msg.message
            }
        )

    # Add current user message
    messages.append(
        {
            "role": "user",
            "content": message
        }
    )

    # Generate AI response
    response = client.chat.completions.create(model=MODEL_NAME,messages=messages,temperature=0.7)
    reply = response.choices[0].message.content

    # Save conversation AFTER generating response
    save_message(db,session_id, "user", message)
    save_message(db,session_id, "assistant", reply)

    return reply