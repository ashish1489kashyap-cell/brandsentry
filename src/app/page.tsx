'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { RecentReviews } from '@/components/dashboard/RecentReviews';
import { QuickActionBanner } from '@/components/dashboard/QuickActionBanner';
import { ILLUSTRATIVE_METRICS, ILLUSTRATIVE_REVIEWS } from '@/lib/mock-data';
import { Info, Sparkles, Database, CheckCircle2, ShieldCheck } from 'lucide-react';
import { StoredReview } from '@/types';
import { useStoredReviews, calculateRealMetrics } from '@/lib/storage';

export default function DashboardPage() {
  const storedReviews = useStoredReviews();
  // Default to REAL stored records (honest workspace)
  const [showSampleData, setShowSampleData] = useState(false);

  const realMetrics = calculateRealMetrics(storedReviews);

  const activeMetrics = showSampleData ? ILLUSTRATIVE_METRICS : realMetrics;
  const activeReviews = showSampleData
    ? (ILLUSTRATIVE_REVIEWS as unknown as StoredReview[])
    : storedReviews;

  return (
    <div className="space-y-6">
      {/* Page Header with Real Mode vs Sample Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Governance Dashboard</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-medium">
              Phase 2 Live Engine
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time pre-publication brand compliance monitoring derived from local stored audits.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800/90 self-start sm:self-auto text-xs">
          <button
            onClick={() => setShowSampleData(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              !showSampleData
                ? 'bg-blue-600 text-white font-medium shadow-sm shadow-blue-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Real Stored Data ({storedReviews.length})</span>
          </button>

          <button
            onClick={() => setShowSampleData(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              showSampleData
                ? 'bg-slate-800 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-300" />
            <span>Sample Benchmark View</span>
          </button>
        </div>
      </div>

      {/* Mode Status Banner */}
      {showSampleData ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-950/40 border border-blue-900/50 text-xs text-blue-300">
          <Info className="w-4 h-4 shrink-0 text-blue-400" />
          <span>
            <strong>Illustrative Benchmark Mode Active:</strong> Displaying labelled hackathon sample data. Switch to &ldquo;Real Stored Data&rdquo; to view real reviews created in your current browser session.
          </span>
        </div>
      ) : storedReviews.length === 0 ? (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Real Workspace Baseline:</strong> Clean slate. 0 stored reviews found in local storage. Submit draft copy in Content Review to generate genuine metrics.
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-emerald-950/30 border border-emerald-900/50 text-xs text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>
            <strong>Real Metrics Active:</strong> Summary cards and audit tables reflect {storedReviews.length} real reviews stored in local persistence.
          </span>
        </div>
      )}

      {/* Quick Action Workflow Banner */}
      <QuickActionBanner />

      {/* Summary Cards Grid (derived from real storage) */}
      <MetricsGrid metrics={activeMetrics} isSampleData={showSampleData} />

      {/* Recent Reviews Table */}
      <RecentReviews reviews={activeReviews} isSampleData={showSampleData} />

      {/* Workflow Navigation Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl border border-slate-800/80 bg-[#0d1527] space-y-2">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
            <span className="w-6 h-6 rounded-lg bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-xs text-blue-300">
              1
            </span>
            <span>Brand Vault Rules</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create and toggle rules for Prohibited Phrases, Required Terminology, and Approved Claims.
          </p>
          <Link href="/vault" className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-block pt-1">
            Manage Brand Rules &rarr;
          </Link>
        </div>

        <div className="p-4 rounded-xl border border-slate-800/80 bg-[#0d1527] space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
            <span className="w-6 h-6 rounded-lg bg-sky-950/80 border border-sky-800/60 flex items-center justify-center text-xs text-sky-300">
              2
            </span>
            <span>Content Review</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Test draft copy against Brand Vault rules, view exact evidence, apply 1-click fixes, and approve.
          </p>
          <Link href="/review" className="text-xs text-sky-400 hover:text-sky-300 font-medium inline-block pt-1">
            Launch Review Tool &rarr;
          </Link>
        </div>

        <div className="p-4 rounded-xl border border-slate-800/80 bg-[#0d1527] space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <span className="w-6 h-6 rounded-lg bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-xs text-emerald-300">
              3
            </span>
            <span>Audit History & Approvals</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Maintain complete governance logs with human sign-offs, severity breakdowns, and revision tracking.
          </p>
          <Link href="/history" className="text-xs text-emerald-400 hover:text-emerald-300 font-medium inline-block pt-1">
            View Audit History &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
