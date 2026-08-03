import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import Loader from '../common/Loader';

export default function ChatWindow({ messages = [], loading = false }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 w-full bg-[#FAFBFC] overflow-y-auto px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Active Conversation Messages */}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {/* Skeleton Loader shown while waiting for initial or follow-up response */}
        {loading && <Loader />}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
