import React from 'react';
import Header from '../components/layout/Header';
import VoiceLanding from '../components/voice/VoiceLanding';
import VoiceIndicator from '../components/voice/VoiceIndicator';
import ChatWindow from '../components/chat/ChatWindow';
import MessageInput from '../components/chat/MessageInput';
import ConversationControls from '../components/common/ConversationControls';
import SummaryModal from '../components/common/SummaryModal';
import Toast from '../components/common/Toast';
import { useChat } from '../hooks/useChat';

export default function Home() {
  const {
    messages,
    loading,
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
    dismissError
  } = useChat();

  const handleToggleListen = () => {
    if (isListening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#EEF4FF] via-[#F7FAFF] to-[#F8FAFC] overflow-hidden font-sans text-[#1E293B]">
      {/* Enterprise Header */}
      <Header />

      {/* Voice Landing Screen (Before conversation starts) */}
      {!conversationStarted ? (
        <div className="flex-1 flex flex-col min-h-0 transition-opacity duration-300 animate-in fade-in">
          <VoiceLanding
            onStartVoice={handleStartConversation}
            loading={loading}
          />
        </div>
      ) : (
        /* Active Voice Conversation Screen */
        <main className="flex-1 flex flex-col min-h-0 relative bg-[#F8FAFC] transition-opacity duration-300 animate-in fade-in">
          {/* Active Session Voice Indicator */}
          <VoiceIndicator
            isListening={isListening}
            isSpeaking={isSpeaking}
            onToggleListen={handleToggleListen}
          />

          {/* Timeline Stream */}
          <ChatWindow messages={messages} loading={loading} />

          {/* Fixed Bottom Control Bar */}
          <div className="bg-[#FFFFFF] border-t border-[#E2E8F0] py-2 px-4 shadow-xs space-y-2">
            {/* Conditional Controlled Text Mode Input */}
            {isTextMode && (
              <MessageInput
                value={inputText}
                onChange={setInputText}
                onSendMessage={handleSendMessage}
                onMicClick={handleToggleListen}
                isListening={isListening}
                disabled={loading || isSpeaking}
                placeholder="Speak naturally or edit your recognized message..."
              />
            )}

            {/* Conversation Controls */}
            <ConversationControls
              conversationStarted={conversationStarted}
              loading={loading}
              isTextMode={isTextMode}
              onEnd={handleEndConversation}
              onToggleTextMode={toggleTextMode}
            />
          </div>
        </main>
      )}

      {/* Customer-Facing Conversation Completed Modal */}
      <SummaryModal
        isOpen={isModalOpen}
        onStartNew={handleNewConversation}
        summaryData={summaryData}
      />

      {/* Error Toast Notification */}
      <Toast message={error} onClose={dismissError} />
    </div>
  );
}
