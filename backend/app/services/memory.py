conversation_store = {}


def get_history(session_id):
    return conversation_store.get(session_id, [])

def save_message(session_id, role, content):

    if session_id not in conversation_store:
        conversation_store[session_id] = []

    conversation_store[session_id].append({
        "role": role,
        "content": content
    })