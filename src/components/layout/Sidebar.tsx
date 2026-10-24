'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  FileSearch,
  History,
  Settings,
  Shield,
  Sparkles,
  ExternalLink,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      description: 'Overview & Metrics',
    },
    {
      label: 'Content Review',
      href: '/review',
      icon: FileSearch,
      description: 'Pre-Publication Scans',
    },
    {
      label: 'Brand Vault',
      href: '/vault',
      icon: ShieldCheck,
      description: 'Guidelines & Policies',
    },
    {
      label: 'Review History',
      href: '/history',
      icon: History,
      description: 'Audit Trail & Logs',
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Rules & Workspace',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#090e1c] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-md shadow-blue-500/25 flex items-center justify-center">
              <div className="w-full h-full bg-[#090e1c] rounded-[10px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <Shield className="w-5 h-5 text-sky-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">BrandSentry</span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60">
                  v0.1
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Brand Governance Engine</p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 lg:hidden rounded-lg hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Platform Menu
            </p>
          </div>

          {navItems.map(item => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 font-semibold shadow-sm shadow-blue-500/10'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white border border-transparent'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate font-normal">
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Hackathon Status & Repo Card in Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#070b16]/70">
          <div className="rounded-xl border border-slate-800 bg-[#0d1424] p-3 text-xs">
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CODEAXIS Hackathon</span>
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed mb-2.5">
              Round 2: Pre-Publication Brand Governance Platform.
            </p>
            <a
              href="https://github.com/ashish1489kashyap-cell/brandsentry"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-blue-400 transition-colors font-medium"
            >
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
};
