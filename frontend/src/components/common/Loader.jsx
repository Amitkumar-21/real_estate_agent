import React from 'react';
import { HiSparkles } from 'react-icons/hi2';

export default function Loader() {
  return (
    <div className="flex w-full space-x-3 max-w-4xl mr-auto justify-start animate-pulse">
      {/* AI Icon Skeleton */}
      <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
        <HiSparkles className="w-3.5 h-3.5" />
      </div>

      {/* Bubble Skeleton */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] px-4 py-3 rounded-2xl rounded-bl-xs shadow-2xs max-w-md w-64 space-y-2">
        <div className="flex items-center space-x-2 text-xs text-[#64748B] font-medium">
          <span>AI is thinking...</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full w-5/6"></div>
        <div className="h-2 bg-slate-100 rounded-full w-2/3"></div>
      </div>
    </div>
  );
}
