from groq import Groq

from app.config import GROQ_API_KEY, MODEL_NAME
from app.services.prompts import SYSTEM_PROMPT
from app.services.knowledge import get_project_info
from app.services.memory import get_history, save_message

client = Groq(api_key=GROQ_API_KEY)


def generate_response(session_id: str, message: str) -> str:
    project = get_project_info()

    system_prompt = f"""
{SYSTEM_PROMPT}

Project Information:

{project}
"""

    # Get previous conversation
    history = get_history(session_id)

    # Build messages for the LLM
    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    # Add previous conversation
    messages.extend(history)

    # Add current user message
    messages.append(
        {
            "role": "user",
            "content": message
        }
    )

    # Generate AI response
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.7
    )

    reply = response.choices[0].message.content

    # Save conversation AFTER generating response
    save_message(session_id, "user", message)
    save_message(session_id, "assistant", reply)

    return reply