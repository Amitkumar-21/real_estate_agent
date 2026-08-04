import { useState, useCallback, useEffect, useRef } from 'react';
import { INITIAL_SUMMARY_STATE } from '../utils/constants';
import { sendMessageApi, endConversationApi } from '../services/api';
import { voiceService } from '../services/voice';
import { speechService } from '../services/speech';

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
 * Web Speech API recognition, ElevenLabs Text-to-Speech, hands-free turn loop,
 * session lifecycle, and error handling.
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [isTextMode, setIsTextMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Persistent refs to prevent stale closure bugs & duplicate session generation
  const sessionIdRef = useRef(null);
  const conversationStartedRef = useRef(false);
  const loadingRef = useRef(false);
  const isModalOpenRef = useRef(false);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    conversationStartedRef.current = conversationStarted;
  }, [conversationStarted]);

  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  useEffect(() => {
    isModalOpenRef.current = isModalOpen;
  }, [isModalOpen]);

  const handleStopListening = useCallback(() => {
    voiceService.stop();
    setIsListening(false);
  }, []);

  const handleStopSpeaking = useCallback(() => {
    speechService.stop();
    setIsSpeaking(false);
  }, []);

  /**
   * Start Voice Listening (Web Speech API)
   * Populates recognized speech into inputText and automatically dispatches to handleSendMessage.
   * Restarts automatically after silence timeouts if conversation is active.
   */
  const handleStartListening = useCallback(() => {
    if (!voiceService.isSupported()) {
      setError('Your browser does not support Speech Recognition. Please use Chrome, Edge, or Safari.');
      return;
    }

    // Never start speech recognition while AI is fetching audio or speaking
    if (speechService.isSpeaking() || loadingRef.current) {
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
        if (errorMessage.includes('permission') || errorMessage.includes('microphone')) {
          setError(errorMessage);
        }
      },
      onEnd: () => {
        setIsListening(false);
        // Auto-restart recognition after silence timeout during active voice session
        if (
          conversationStartedRef.current &&
          !loadingRef.current &&
          !speechService.isSpeaking() &&
          !isModalOpenRef.current
        ) {
          setTimeout(() => {
            if (
              conversationStartedRef.current &&
              !loadingRef.current &&
              !speechService.isSpeaking() &&
              !isModalOpenRef.current
            ) {
              handleStartListening();
            }
          }, 750);
        }
      }
    });
  }, []);

  /**
   * Speak AI message using ElevenLabs SpeechService (Text-to-Speech).
   * Automatically activates speech recognition ONLY AFTER TTS playback completes.
   */
  const speakAiMessage = useCallback(
    (text) => {
      handleStopListening();
      setIsSpeaking(true);

      speechService.speak(text, {
        onStart: () => {
          setIsSpeaking(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
          // Auto-start speech recognition AFTER AI finishes speaking
          setTimeout(() => {
            if (
              conversationStartedRef.current &&
              !loadingRef.current &&
              !isModalOpenRef.current
            ) {
              handleStartListening();
            }
          }, 300);
        },
        onError: () => {
          setIsSpeaking(false);
          setTimeout(() => {
            if (
              conversationStartedRef.current &&
              !loadingRef.current &&
              !isModalOpenRef.current
            ) {
              handleStartListening();
            }
          }, 300);
        }
      });
    },
    [handleStopListening, handleStartListening]
  );

  /**
   * Send User Message:
   * 1. Appends user message
   * 2. Calls POST /chat with active sessionIdRef.current
   * 3. Appends AI response
   * 4. Speaks AI response via ElevenLabs Text-to-Speech
   */
  const handleSendMessage = useCallback(
    async (text) => {
      const messageToSend = text || inputText;
      if (!messageToSend || !messageToSend.trim() || loadingRef.current) return;

      setError(null);
      handleStopListening();
      handleStopSpeaking();

      const activeSessionId = sessionIdRef.current;
      if (!activeSessionId) return;

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

        // Speak AI reply via ElevenLabs TTS
        speakAiMessage(aiReply);
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
    [inputText, handleStopListening, handleStopSpeaking, speakAiMessage]
  );

  /**
   * Start Voice Conversation:
   * 1. Generate new session_id (EXACTLY ONCE at session start)
   * 2. Fetch initial AI greeting from POST /chat
   * 3. Render initial greeting immediately
   * 4. Synthesize initial AI greeting via ElevenLabs TTS
   * 5. Open Speech Recognition ONLY AFTER initial greeting playback finishes
   */
  const handleStartConversation = useCallback(async () => {
    if (conversationStartedRef.current || loadingRef.current) return;

    const newSessionId = generateUniqueSessionId();
    sessionIdRef.current = newSessionId;
    setSessionId(newSessionId);
    conversationStartedRef.current = true;
    setConversationStarted(true);
    setMessages([]);
    setIsTextMode(false);
    setError(null);
    setLoading(true);
    handleStopSpeaking();

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

      // Speak initial AI greeting via ElevenLabs TTS
      speakAiMessage(firstGreeting);
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
  }, [handleStopSpeaking, speakAiMessage]);

  const toggleTextMode = useCallback(() => {
    setIsTextMode((prev) => !prev);
  }, []);

  const handleEndConversation = useCallback(async () => {
    handleStopListening();
    handleStopSpeaking();

    const activeSessionId = sessionIdRef.current;
    if (!activeSessionId) {
      setIsModalOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await endConversationApi(activeSessionId);
      setSummaryData(data);
      conversationStartedRef.current = false;
      setConversationStarted(false);
      setIsModalOpen(true);
    } catch (err) {
      console.error('End Conversation API Error:', err);
      setError('Unable to fetch conversation summary from backend.');
      setIsModalOpen(true);
    } finally {
      setLoading(false);
    }
  }, [handleStopListening, handleStopSpeaking]);

  const handleNewConversation = useCallback(() => {
    handleStopListening();
    handleStopSpeaking();
    sessionIdRef.current = null;
    conversationStartedRef.current = false;
    setMessages([]);
    setSessionId(null);
    setConversationStarted(false);
    setIsTextMode(false);
    setInputText('');
    setSummaryData(null);
    setError(null);
    setIsModalOpen(false);
  }, [handleStopListening, handleStopSpeaking]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  // Cleanup speech synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      voiceService.stop();
      speechService.stop();
    };
  }, []);

  return {
    messages,
    loading,
    sessionId,
    conversationStarted,
    isTextMode,
    isListening,
    isSpeaking,
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
