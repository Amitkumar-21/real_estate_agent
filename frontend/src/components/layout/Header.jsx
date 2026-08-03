import React from 'react';
import { HiMicrophone } from 'react-icons/hi2';
import { APP_CONFIG } from '../../utils/constants';

export default function Header() {
  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#E2E8F0] px-6 py-2.5 sticky top-0 z-10 shadow-2xs">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            <HiMicrophone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#1E293B] leading-tight">
              {APP_CONFIG.TITLE}
            </h1>
            <p className="text-xs text-[#64748B] font-normal">
              {APP_CONFIG.SUBTITLE}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
