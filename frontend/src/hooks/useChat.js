import { useState, useCallback, useEffect } from 'react';
import { INITIAL_SUMMARY_STATE } from '../utils/constants';
import { sendMessageApi, endConversationApi } from '../services/api';
import { voiceService } from '../services/voice';

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
 * Web Speech API recognition, hands-free turn loop, session lifecycle, and error handling.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleStopListening = useCallback(() => {
    voiceService.stop();
    setIsListening(false);
  }, []);

  /**
   * Send User Message:
   * 1. Appends user message
   * 2. Calls POST /chat
   * 3. Appends AI response
   * 4. Resets inputText
   */
  const handleSendMessage = useCallback(
    async (text) => {
      const messageToSend = text || inputText;
      if (!messageToSend || !messageToSend.trim() || loading) return;

      setError(null);
      handleStopListening();

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
        content: messageToSend,
        timestamp: userMsgTime
      };

      setMessages((prev) => [...prev, userMessage]);
      setInputText('');
      setLoading(true);

      try {
        const data = await sendMessageApi(activeSessionId, messageToSend);
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
    [sessionId, inputText, loading, handleStopListening]
  );

  /**
   * Start Voice Listening (Web Speech API)
   * Populates recognized speech into inputText and automatically dispatches to handleSendMessage.
   */
  const handleStartListening = useCallback(() => {
    if (!voiceService.isSupported()) {
      setError('Your browser does not support Speech Recognition. Please use Chrome, Edge, or Safari.');
      return;
    }

    voiceService.start({
      onStart: () => {
        setIsListening(true);
      },
      onResult: (transcript) => {
        setInputText(transcript);
        if (transcript && transcript.trim()) {
          handleSendMessage(transcript);
        }
      },
      onError: (errorMessage) => {
        setIsListening(false);
        setError(errorMessage);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  }, [handleSendMessage]);

  /**
   * Start Voice Conversation:
   * 1. Generate session_id
   * 2. Fetch initial AI greeting from POST /chat
   * 3. Hands-free loop will automatically start Speech Recognition once greeting arrives
   */
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

  // Hands-free turn loop:
  // Automatically re-activates Speech Recognition after an AI response renders and completes
  useEffect(() => {
    if (
      conversationStarted &&
      !loading &&
      !isModalOpen &&
      !isListening &&
      messages.length > 0 &&
      messages[messages.length - 1].role === 'assistant'
    ) {
      const timer = setTimeout(() => {
        handleStartListening();
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [conversationStarted, loading, isModalOpen, isListening, messages, handleStartListening]);

  const toggleTextMode = useCallback(() => {
    setIsTextMode((prev) => !prev);
  }, []);

  const handleEndConversation = useCallback(async () => {
    handleStopListening();

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
  }, [sessionId, handleStopListening]);

  const handleNewConversation = useCallback(() => {
    handleStopListening();
    setMessages([]);
    setSessionId(null);
    setConversationStarted(false);
    setIsTextMode(false);
    setInputText('');
    setSummaryData(null);
    setError(null);
    setIsModalOpen(false);
  }, [handleStopListening]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      voiceService.stop();
    };
  }, []);

  return {
    messages,
    loading,
    sessionId,
    conversationStarted,
    isTextMode,
    isListening,
    inputText,
    setInputText,
    summaryData,
    error,
    isModalOpen,
    handleStartConversation,
    handleStartListening,
    handleStopListening,
    toggleTextMode,
    handleSendMessage,
    handleEndConversation,
    handleNewConversation,
    closeModal,
    dismissError
  };
}
