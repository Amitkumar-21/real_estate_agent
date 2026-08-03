import React from 'react';
import { HiPhoneXMark, HiChatBubbleLeftEllipsis } from 'react-icons/hi2';

export default function ConversationControls({
  conversationStarted = false,
  loading = false,
  isTextMode = false,
  onEnd,
  onToggleTextMode
}) {
  if (!conversationStarted) return null;

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#E2E8F0] bg-[#FFFFFF]">
      {/* End Conversation Button */}
      <button
        onClick={onEnd}
        disabled={loading}
        className="w-full sm:w-auto px-6 py-2.5 bg-[#EF4444] hover:bg-red-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        <HiPhoneXMark className="w-4 h-4" />
        <span>End Conversation</span>
      </button>

      {/* Secondary Option: Switch to Text Mode Toggle */}
      <button
        type="button"
        onClick={onToggleTextMode}
        className="text-xs text-[#64748B] hover:text-[#2563EB] font-medium flex items-center space-x-1.5 transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
      >
        <HiChatBubbleLeftEllipsis className="w-4 h-4 text-slate-400" />
        <span>
          {isTextMode
            ? 'Hide Text Mode'
            : 'Having microphone issues? Switch to Text Mode'}
        </span>
      </button>
    </div>
  );
}
