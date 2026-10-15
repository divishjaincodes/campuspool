import React from 'react';
import { GenderPreference } from '../../types';
import { ShieldCheck, Users, Shield } from 'lucide-react';

interface GenderBadgeProps {
  preference: GenderPreference;
  className?: string;
}

export const GenderBadge: React.FC<GenderBadgeProps> = ({ preference, className = '' }) => {
  if (preference === 'women_only') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200/80 ${className}`}
        title="Women-only ride: Reserved for female students for safety & comfort"
      >
        <Shield className="w-3.5 h-3.5 text-rose-600" />
        <span>Women-only</span>
      </span>
    );
  }

  if (preference === 'men_only') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/80 ${className}`}
      >
        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
        <span>Men-only</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F7] text-[#1D1D1F] border border-[#D2D2D7]/60 ${className}`}
    >
      <Users className="w-3.5 h-3.5 text-[#6E6E73]" />
      <span>Everyone welcome</span>
    </span>
  );
};
