import React, { useState } from 'react';
import { HiPaperAirplane, HiMicrophone } from 'react-icons/hi2';

export default function MessageInput({
  onSendMessage,
  onMicClick,
  disabled = false,
  placeholder = 'Type your message or ask about properties...'
}) {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || disabled) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMicPress = (e) => {
    e.preventDefault();
    if (onMicClick) {
      onMicClick();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-5xl mx-auto px-4 py-2"
    >
      <div className="relative flex items-center bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl shadow-xs focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
        {/* Text Input */}
        <textarea
          rows={1}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full py-3.5 pl-5 pr-24 text-sm text-[#1E293B] bg-transparent placeholder-[#64748B] focus:outline-none resize-none disabled:opacity-50 min-h-[48px] max-h-32"
        />

        {/* Control Buttons Container */}
        <div className="absolute right-3 flex items-center space-x-1.5">
          {/* Microphone Button Placeholder */}
          <button
            type="button"
            onClick={handleMicPress}
            disabled={disabled}
            title="Voice Integration (Coming Soon)"
            className="p-2 text-[#64748B] hover:text-[#2563EB] hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-40 disabled:hover:bg-transparent"
          >
            <HiMicrophone className="w-5 h-5" />
          </button>

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || !inputText.trim()}
            title="Send Message"
            className="p-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg transition-all shadow-xs disabled:opacity-40 disabled:hover:bg-[#2563EB] disabled:cursor-not-allowed"
          >
            <HiPaperAirplane className="w-4 h-4" />
          </button>
        </div>
      </div>
    </form>
  );
}
