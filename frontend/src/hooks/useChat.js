import { useState, useCallback } from 'react';
import { INITIAL_SUMMARY_STATE } from '../utils/constants';
import { sendMessageApi, endConversationApi } from '../services/api';

/**
 * Helper to generate session ID using crypto.randomUUID() with fallback.
 */
const generateUniqueSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Custom hook managing voice-first state, FastAPI backend communication,
 * session lifecycle, error handling, and modal triggers.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStartConversation = useCallback(async () => {
    const newSessionId = generateUniqueSessionId();
    setSessionId(newSessionId);
    setConversationStarted(true);
    setMessages([]);
    setIsTextMode(false);
    setError(null);
    setLoading(true);

    try {
      const data = await sendMessageApi(newSessionId, 'Hi');
      const firstGreeting = data?.reply || 'Hello! Welcome to our real estate sales assistance. How can I help you today?';

      const aiMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setMessages([
        {
          id: `msg_ai_${Date.now()}`,
          role: 'assistant',
          content: firstGreeting,
          timestamp: aiMsgTime
        }
      ]);
    } catch (err) {
      console.error('Initial Greeting API Error:', err);
      const errorMsg =
        err.code === 'ECONNABORTED'
          ? 'Backend connection timed out. Please verify FastAPI server is running on http://127.0.0.1:8000.'
          : err.response?.data?.detail || err.message || 'Unable to connect to backend server at http://127.0.0.1:8000.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleTextMode = useCallback(() => {
    setIsTextMode((prev) => !prev);
  }, []);

  const handleSendMessage = useCallback(
    async (text) => {
      if (!text || !text.trim() || loading) return;

      setError(null);

      let activeSessionId = sessionId;
      if (!activeSessionId) {
        activeSessionId = generateUniqueSessionId();
        setSessionId(activeSessionId);
        setConversationStarted(true);
      }

      const userMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const userMessage = {
        id: `msg_user_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: userMsgTime
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        const data = await sendMessageApi(activeSessionId, text);
        const aiReply = data?.reply || 'Thank you for your message. How else can I assist with your property search?';

        const aiMsgTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const aiMessage = {
          id: `msg_ai_${Date.now()}`,
          role: 'assistant',
          content: aiReply,
          timestamp: aiMsgTime
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (err) {
        console.error('Chat API Error:', err);
        const errorMsg =
          err.code === 'ECONNABORTED'
            ? 'Request timed out. Please check backend server.'
            : err.response?.data?.detail || err.message || 'Failed to send message to backend.';
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [sessionId, loading]
  );

  const handleEndConversation = useCallback(async () => {
    if (!sessionId) {
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await endConversationApi(sessionId);
      setSummaryData(data);
      setConversationStarted(false);
      setIsModalOpen(true);
    } catch (err) {
      console.error('End Conversation API Error:', err);
      setError('Unable to fetch conversation summary from backend.');
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleNewConversation = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    setConversationStarted(false);
    setIsTextMode(false);
    setSummaryData(null);
    setError(null);
    setIsModalOpen(false);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    loading,
    sessionId,
    conversationStarted,
    isTextMode,
    summaryData,
    error,
    isModalOpen,
    handleStartConversation,
    toggleTextMode,
    handleSendMessage,
    handleEndConversation,
    handleNewConversation,
    closeModal,
    dismissError
  };
}
