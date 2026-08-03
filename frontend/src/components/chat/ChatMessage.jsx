import React from 'react';
import ReactMarkdown from 'react-markdown';
import { HiUser, HiSparkles } from 'react-icons/hi2';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex w-full space-x-3 max-w-4xl ${
        isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'
      }`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
          <HiSparkles className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Message Content Bubble */}
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed max-w-lg ${
            isUser
              ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white rounded-br-xs font-normal shadow-xs'
              : 'bg-[#FFFFFF] text-[#1E293B] rounded-bl-xs border border-[#E2E8F0] shadow-2xs'
          }`}
        >
          {isUser ? (
            /* Plain Text for User Messages */
            message.content
          ) : (
            /* Rendered Markdown for AI Messages */
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc pl-4 my-1.5 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-4 my-1.5 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="leading-snug">{children}</li>,
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2563EB] underline hover:text-blue-700 font-medium"
                  >
                    {children}
                  </a>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <span className="text-[11px] text-[#64748B] mt-1 px-1 font-medium">
            {message.timestamp}
          </span>
        )}
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <HiUser className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
