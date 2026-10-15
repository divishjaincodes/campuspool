import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-xs text-[#6E6E73]">
      <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F]">Community Code of Conduct & Terms</h1>
      <p className="text-[11px] text-[#A1A1A6]">Last updated: October 2026</p>

      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D2D2D7]/80 p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#1D1D1F]">1. Non-Commercial Academic Nature</h2>
        <p className="leading-relaxed">
          CampusPool is an internal student platform intended to facilitate cost-sharing among students of VIT Bhopal University. It is strictly non-commercial and must not be used as a taxi business or for-profit enterprise.
        </p>

        <h2 className="text-sm font-bold text-[#1D1D1F]">2. Single Student Role</h2>
        <p className="leading-relaxed">
          Every account represents a student. Any student may offer a ride or book seats. Creating a ride does not confer a commercial driver status.
        </p>

        <h2 className="text-sm font-bold text-[#1D1D1F]">3. Respectful Conduct</h2>
        <p className="leading-relaxed">
          Students are expected to treat peers with mutual respect and professionalism. Harassment, reckless driving, or inappropriate communication will lead to immediate account suspension.
        </p>

        <h2 className="text-sm font-bold text-[#1D1D1F]">4. Women-Only Spaces</h2>
        <p className="leading-relaxed">
          Rides designated as Women-Only must be respected. Circumventing gender eligibility rules constitutes a violation of university community conduct.
        </p>
      </div>
    </div>
  );
};
