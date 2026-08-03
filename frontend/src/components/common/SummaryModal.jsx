import React from 'react';
import { HiCheckCircle, HiPlusCircle } from 'react-icons/hi2';

/**
 * Extracts key lead fields from backend response payload or text summary.
 */
function extractLeadDetails(data) {
  if (!data) {
    return {
      propertyType: 'Not specified',
      location: 'Not specified',
      budget: 'Not specified',
      purpose: 'Not specified',
      timeline: 'Not specified',
      phone: 'Not specified',
      email: 'Not specified'
    };
  }

  // 1. Direct object properties if present
  let propertyType = data.property_type || data.configuration || '';
  let location = data.location || data.preferred_location || '';
  let budget = data.budget || '';
  let purpose = data.purpose || '';
  let timeline = data.timeline || '';
  let phone = data.phone || data.phone_number || '';
  let email = data.email || '';

  const summaryText = typeof data === 'string' ? data : data.summary || data.raw_response || '';

  // 2. Parse from summary text if missing
  if (summaryText) {
    if (!phone) {
      const phoneMatch = summaryText.match(/\b\d{10}\b/) || summaryText.match(/phone\s*(?:number)?\s*\(?(\d{10})\)?/i);
      if (phoneMatch) phone = phoneMatch[1] || phoneMatch[0];
    }

    if (!email) {
      const emailMatch = summaryText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      if (emailMatch) email = emailMatch[0];
    }

    if (!budget) {
      const budgetMatch = summaryText.match(/₹?\s?\d+\s?(?:Lakhs?|Crores?|L|Cr)/i) || summaryText.match(/budget\s+of\s+around\s+([^.\n,]+)/i);
      if (budgetMatch) budget = budgetMatch[0];
    }

    if (!propertyType) {
      const propMatch = summaryText.match(/\d\s*BHK\s*(?:apartment|flat|house|villa|plot)?/i) || summaryText.match(/(?:apartment|villa|plot|flat|commercial)/i);
      if (propMatch) propertyType = propMatch[0];
    }

    if (!location) {
      const locMatch = summaryText.match(/in\s+([A-Z][a-zA-Z0-9\s()]+?)(?=\s+for|\s+with|\s+aims|\.|\,)/);
      if (locMatch) location = locMatch[1];
    }

    if (!purpose) {
      const purpMatch = summaryText.match(/(?:own residence|residence|self-use|investment|personal use)/i);
      if (purpMatch) purpose = purpMatch[0];
    }

    if (!timeline) {
      const timeMatch = summaryText.match(/within\s+(?:the\s+)?next\s+[a-zA-Z0-9\s]+/i) || summaryText.match(/within\s+[a-zA-Z0-9\s]+/i);
      if (timeMatch) timeline = timeMatch[0];
    }
  }

  return {
    propertyType: propertyType || 'Not specified',
    location: location || 'Not specified',
    budget: budget || 'Not specified',
    purpose: purpose || 'Not specified',
    timeline: timeline || 'Not specified',
    phone: phone || 'Not specified',
    email: email || 'Not specified'
  };
}

export default function SummaryModal({
  isOpen = false,
  onStartNew,
  summaryData = null
}) {
  if (!isOpen) return null;

  const lead = extractLeadDetails(summaryData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity">
      {/* Customer-Facing Conversation Completed Modal */}
      <div className="bg-[#FFFFFF] border border-[#D8E7FF] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] bg-[#FAFBFC] flex items-center space-x-3">
          <HiCheckCircle className="w-6 h-6 text-[#10B981] flex-shrink-0" />
          <div>
            <h2 className="text-base font-semibold text-[#1E293B]">
              Conversation Completed
            </h2>
          </div>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Customer Success Message */}
          <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Thank you for speaking with our AI Real Estate Assistant. We've successfully recorded your property requirements.
          </p>

          {/* Clean Read-Only Customer Lead Data Card */}
          <div className="p-4 bg-[#F8FAFF] border border-[#D8E7FF] rounded-xl space-y-3">
            <h3 className="text-xs font-semibold text-[#2563EB] uppercase tracking-wider mb-3">
              Recorded Property Requirements
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              <div>
                <span className="text-[#64748B] block text-[11px] font-medium">Property Type</span>
                <span className="text-[#1E293B] font-semibold">{lead.propertyType}</span>
              </div>

              <div>
                <span className="text-[#64748B] block text-[11px] font-medium">Preferred Location</span>
                <span className="text-[#1E293B] font-semibold">{lead.location}</span>
              </div>

              <div>
                <span className="text-[#64748B] block text-[11px] font-medium">Budget</span>
                <span className="text-[#1E293B] font-semibold">{lead.budget}</span>
              </div>

              <div>
                <span className="text-[#64748B] block text-[11px] font-medium">Purpose</span>
                <span className="text-[#1E293B] font-semibold capitalize">{lead.purpose}</span>
              </div>

              <div>
                <span className="text-[#64748B] block text-[11px] font-medium">Timeline</span>
                <span className="text-[#1E293B] font-semibold">{lead.timeline}</span>
              </div>

              <div>
                <span className="text-[#64748B] block text-[11px] font-medium">Phone Number</span>
                <span className="text-[#1E293B] font-semibold">{lead.phone}</span>
              </div>

              <div className="sm:col-span-2">
                <span className="text-[#64748B] block text-[11px] font-medium">Email</span>
                <span className="text-[#1E293B] font-semibold">{lead.email}</span>
              </div>
            </div>
          </div>

          {/* Follow-up Note */}
          <p className="text-xs text-[#64748B] leading-relaxed pt-1">
            Our team will review your requirements and contact you if any additional information is needed.
          </p>
        </div>

        {/* Modal Footer with Single Primary Action */}
        <div className="px-6 py-4 bg-[#FAFBFC] border-t border-[#E2E8F0] flex justify-end">
          <button
            onClick={onStartNew}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] hover:from-[#1D4ED8] hover:to-[#2563EB] text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <HiPlusCircle className="w-4 h-4" />
            <span>Start New Conversation</span>
          </button>
        </div>

      </div>
    </div>
  );
}
