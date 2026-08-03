import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import Loader from '../common/Loader';
import { HiBuildingStorefront, HiClipboardDocumentCheck, HiCalendarDays, HiSparkles } from 'react-icons/hi2';

export default function ChatWindow({ messages = [], loading = false }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="flex-1 w-full bg-[#FAFBFC] overflow-y-auto px-4 py-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {messages.length === 0 ? (
          /* Welcoming Empty State */
          <div className="min-h-[420px] flex flex-col items-center justify-center text-center p-8 border border-[#E2E8F0] rounded-2xl bg-[#FFFFFF] shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] mb-4">
              <HiSparkles className="w-6 h-6" />
            </div>

            <h2 className="text-base font-semibold text-[#1E293B] mb-2">
              Welcome to your AI Real Estate Assistant
            </h2>
            <p className="text-xs text-[#64748B] max-w-lg leading-relaxed mb-6">
              I can assist you with real estate inquiries, lead qualification, property details, pricing info, and scheduling site visits.
            </p>

            {/* Feature Capability Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl text-left">
              <div className="p-3.5 bg-[#FAFBFC] border border-[#E2E8F0] rounded-xl flex items-start space-x-3">
                <HiBuildingStorefront className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[#1E293B]">Property Inquiries</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Ask about property specs, locations, & pricing details.</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAFBFC] border border-[#E2E8F0] rounded-xl flex items-start space-x-3">
                <HiClipboardDocumentCheck className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[#1E293B]">Lead Qualification</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Collect buyer requirements, budgets, & timelines.</p>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAFBFC] border border-[#E2E8F0] rounded-xl flex items-start space-x-3">
                <HiCalendarDays className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-[#1E293B]">Schedule Tours</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Book site visits & follow-up client calls effortlessly.</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Message Stream */
          messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)
        )}

        {/* Lightweight Skeleton Loader */}
        {loading && <Loader />}

        {/* Auto-scroll anchor */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
