import React from 'react';
import { Outlet } from 'react-router-dom';
import { DemoSwitcher } from '../common/DemoSwitcher';
import { Navbar } from '../common/Navbar';
import { BottomNav } from '../common/BottomNav';
import { Footer } from '../common/Footer';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] text-[#1D1D1F]">
      <DemoSwitcher />
      <Navbar />
      <main className="flex-1 pb-20 md:pb-10">
        <Outlet />
      </main>
      <BottomNav />
      <Footer />
    </div>
  );
};
