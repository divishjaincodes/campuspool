import React from 'react';

/**
 * DemoSwitcher is disabled in production database mode.
 * Real authentication and student profiles are managed via Supabase.
 */
export const DemoSwitcher: React.FC = () => {
  if (import.meta.env.VITE_ENABLE_DEMO !== 'true') {
    return null;
  }

  return null;
};
