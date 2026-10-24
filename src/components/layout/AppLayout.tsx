'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ToastProvider } from '@/components/ui/Toast';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col">
        {/* Sidebar */}
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:pl-72 transition-[padding] duration-300">
          <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Footer note */}
          <footer className="py-4 px-6 border-t border-slate-900 text-center text-xs text-slate-500">
            BrandSentry &bull; AI-Powered Pre-Publication Brand Governance Platform &bull; CODEAXIS Hackathon Round 2
          </footer>
        </div>
      </div>
    </ToastProvider>
  );
};
