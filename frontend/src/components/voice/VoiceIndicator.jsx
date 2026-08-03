import React from 'react';
import { HiMicrophone } from 'react-icons/hi2';

export default function VoiceIndicator({ isListening = true, onToggleListen }) {
  return (
    <div className="w-full bg-[#FFFFFF] border-b border-[#E2E8F0] px-4 py-2.5 shadow-2xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Active Session Status */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]"></span>
          </div>
          <span className="text-xs font-semibold text-[#1E293B]">
            Voice Session Active
          </span>
        </div>

        {/* Voice Status Indicator Button */}
        <button
          onClick={onToggleListen}
          type="button"
          className={`flex items-center space-x-2 text-xs px-3 py-1.5 rounded-full border transition-all ${
            isListening
              ? 'bg-blue-50 border-blue-200 text-[#2563EB] shadow-2xs'
              : 'bg-[#F8FAFF] border-[#E2E8F0] text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <span className="text-xs">🎤</span>
          {isListening && (
            <div className="flex items-center space-x-0.5 h-3">
              <span className="w-0.5 h-full bg-[#2563EB] animate-pulse"></span>
              <span className="w-0.5 h-2 bg-blue-400 animate-pulse delay-75"></span>
              <span className="w-0.5 h-3 bg-[#2563EB] animate-pulse delay-150"></span>
              <span className="w-0.5 h-1.5 bg-blue-300 animate-pulse delay-100"></span>
            </div>
          )}
          <span className="text-xs font-medium pl-0.5">
            {isListening ? 'Listening...' : 'Click Mic to Speak'}
          </span>
        </button>
      </div>
    </div>
  );
}
