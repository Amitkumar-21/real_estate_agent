import React from 'react';
import { HiExclamationCircle, HiXMark } from 'react-icons/hi2';

export default function Toast({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-3 bg-red-600 text-white px-4 py-3 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-200 max-w-md border border-red-500">
      <HiExclamationCircle className="w-5 h-5 flex-shrink-0 text-white" />
      <span className="text-xs font-medium leading-normal flex-1">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-red-700 rounded-lg transition-colors text-white"
        title="Dismiss"
      >
        <HiXMark className="w-4 h-4" />
      </button>
    </div>
  );
}
