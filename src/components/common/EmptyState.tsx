import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-[#FFFFFF] rounded-2xl border border-[#D2D2D7]/60 p-8 text-center max-w-md mx-auto my-6 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] text-[#0071E3] flex items-center justify-center mx-auto mb-3.5">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-[#1D1D1F] tracking-tight">{title}</h3>
      <p className="text-xs text-[#6E6E73] mt-1.5 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold shadow-sm transition active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
