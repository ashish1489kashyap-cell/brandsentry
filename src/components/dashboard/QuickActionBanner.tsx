import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const QuickActionBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/70 via-[#0d162b] to-[#0a1122] border border-blue-900/40 p-6 shadow-xl mb-6">
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Publication Brand Governance Platform</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Stop Brand Deviations Before They Go Live
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            BrandSentry scans copy, social posts, press releases, and marketing assets against your central Brand Vault rules to safeguard tone, terminology, and legal compliance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/vault">
            <Button
              variant="outline"
              size="md"
              icon={<BookOpen className="w-4 h-4 text-sky-400" />}
            >
              Explore Brand Vault
            </Button>
          </Link>
          <Link href="/review">
            <Button
              variant="primary"
              size="md"
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Run Content Scan
            </Button>
          </Link>
        </div>
      </div>

      {/* Background visual flair */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-1/2 -top-12 w-48 h-48 bg-sky-500/5 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
};
