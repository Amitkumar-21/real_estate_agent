import React from 'react';
import { HiMicrophone } from 'react-icons/hi2';

export default function VoiceLanding({ onStartVoice, loading = false }) {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#EEF4FF] via-[#F7FAFF] to-[#F8FAFC] overflow-hidden">
      {/* Soft Blurred Blue Radial Accent (8-10% opacity) */}
      <div className="absolute w-[500px] h-[360px] bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none -top-10 left-1/2 -translate-x-1/2" />

      {/* Main Hero Card Container */}
      <div className="relative w-full max-w-xl bg-[#FFFFFF] border border-[#D8E7FF] rounded-2xl p-8 sm:p-12 md:p-14 shadow-[0_8px_30px_rgba(37,99,235,0.08)] text-center space-y-8 sm:space-y-10 z-10">
        {/* Microphone Icon Container (#E8F1FF background, #D8E7FF border) */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#E8F1FF] border border-[#D8E7FF] flex items-center justify-center text-[#2563EB] shadow-2xs">
          <HiMicrophone className="w-8 h-8 animate-mic-pulse" />
        </div>

        {/* Headlines */}
        <div className="space-y-2.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1E293B] tracking-tight">
            AI Real Estate Voice Agent
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-[#2563EB]">
            AI-powered Real Estate Sales Assistant
          </p>
          <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto leading-relaxed pt-2">
            Speak naturally with our AI assistant to discuss your property requirements, budget, preferred locations, and schedule site tours in real-time.
          </p>
        </div>

        {/* Primary Focal CTA Button */}
        <div className="pt-3 pb-2">
          <button
            onClick={onStartVoice}
            disabled={loading}
            className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white font-semibold text-sm rounded-xl shadow-md shadow-blue-500/20 transition-all transform active:scale-98 flex items-center justify-center space-x-3 mx-auto disabled:opacity-50"
          >
            <HiMicrophone className="w-5 h-5 text-white animate-mic-pulse" />
            <span>Start Voice Conversation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
