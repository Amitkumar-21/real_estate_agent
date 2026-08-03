import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

/**
 * POST /chat
 * Direct Axios request to FastAPI backend
 * Request: { "session_id": string, "message": string }
 * Response: { "reply": string }
 */
export const sendMessageApi = async (sessionId, messageText) => {
  const response = await apiClient.post('/chat', {
    session_id: String(sessionId),
    message: String(messageText)
  });
  return response.data;
};

/**
 * POST /end-conversation
 * Direct Axios request to FastAPI backend
 * Request: { "session_id": string }
 * Response: { "summary": string, "next_action": string }
 */
export const endConversationApi = async (sessionId) => {
  const response = await apiClient.post('/end-conversation', {
    session_id: String(sessionId)
  });
  return response.data;
};
