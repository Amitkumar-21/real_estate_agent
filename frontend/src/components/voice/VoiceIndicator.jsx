import React from 'react';
import { HiMicrophone } from 'react-icons/hi2';

export default function VoiceIndicator({ isListening = true }) {
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

        {/* Minimal Audio Waveform Indicator */}
        <div className="flex items-center space-x-2 text-xs text-[#64748B] bg-[#F8FAFF] border border-[#E2E8F0] px-3 py-1 rounded-full">
          <HiMicrophone className="w-4 h-4 text-[#2563EB] animate-pulse" />
          <div className="flex items-center space-x-0.5 h-3">
            <span className="w-0.5 h-full bg-[#2563EB] animate-pulse"></span>
            <span className="w-0.5 h-2 bg-blue-400 animate-pulse delay-75"></span>
            <span className="w-0.5 h-3 bg-[#2563EB] animate-pulse delay-150"></span>
            <span className="w-0.5 h-1.5 bg-blue-300 animate-pulse delay-100"></span>
          </div>
          <span className="text-[11px] font-medium text-[#1E293B] pl-1">
            {isListening ? 'Listening...' : 'AI Speaking'}
          </span>
        </div>
      </div>
    </div>
  );
}
