'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, PlusCircle, Shield, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

interface TopBarProps {
  onOpenMobileMenu: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenMobileMenu }) => {
  const { showRoadmapNotice } = useToast();

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#090e1c]/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger & Context breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-200">Production Workspace:</span>
            <span className="text-slate-400">Enterprise Brand Ops</span>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950/60 text-blue-400 border border-blue-800/40">
            <Shield className="w-3 h-3" />
            <span className="hidden md:inline">Phase 1: Rule Engine Ready</span>
            <span className="md:hidden">Phase 1</span>
          </div>
        </div>
      </div>

      {/* Right: Quick notifications & Primary Action to Review Content */}
      <div className="flex items-center gap-3">
        {/* Notifications button with toast callback */}
        <button
          onClick={() => showRoadmapNotice('Notification Center')}
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-colors"
          title="Notifications"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        {/* Primary Action Button: Clear action to review content */}
        <Link href="/review">
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" />}
            className="font-semibold shadow-md shadow-blue-600/20"
          >
            Review Content
          </Button>
        </Link>
      </div>
    </header>
  );
};
