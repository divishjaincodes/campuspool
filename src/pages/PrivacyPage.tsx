import React from 'react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-xs text-[#6E6E73]">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F]">Student Privacy Policy</h1>
      <p className="text-[11px] text-[#A1A1A6]">Last updated: October 2026</p>

      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#1D1D1F]">1. Minimum Necessary Data Collection</h2>
        <p className="leading-relaxed">
          CampusPool collects only necessary student details: your name, verified university email, self-declared gender (for ride preferences), and optional phone number.
        </p>

        <h2 className="text-sm font-bold text-[#1D1D1F]">2. Gender Information Privacy</h2>
        <p className="leading-relaxed">
          Gender is self-declared and used strictly for eligibility enforcement in Women-Only rides. It is not inferred from your photo or name.
        </p>

        <h2 className="text-sm font-bold text-[#1D1D1F]">3. Phone Number Privacy</h2>
        <p className="leading-relaxed">
          Your phone number is never displayed publicly on search results. It is only accessible to students with a confirmed booking on the same ride.
        </p>
      </div>
    </div>
  );
};
