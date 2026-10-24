'use client';

import React from 'react';
import { FileCheck2, AlertCircle, Clock, Award } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { DashboardMetrics } from '@/types';

interface MetricsGridProps {
  metrics: DashboardMetrics;
  isSampleData: boolean;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, isSampleData }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Reviews Analyzed */}
      <StatCard
        title="Reviews Analyzed"
        value={metrics.totalReviews === 0 && !isSampleData ? '0' : metrics.totalReviews}
        subtitle={metrics.totalReviews > 0 ? 'content items' : 'no scans yet'}
        icon={<FileCheck2 className="w-5 h-5" />}
        trend={isSampleData ? metrics.trendReviews : undefined}
        trendLabel="vs last month"
        isSampleData={isSampleData}
        accentColor="blue"
      />

      {/* 2. Detected Issues */}
      <StatCard
        title="Detected Issues"
        value={metrics.detectedIssues === 0 && !isSampleData ? '0' : metrics.detectedIssues}
        subtitle={metrics.detectedIssues > 0 ? 'rules flagged' : 'zero violations'}
        icon={<AlertCircle className="w-5 h-5" />}
        trend={isSampleData ? metrics.trendIssues : undefined}
        trendLabel="reduction"
        isSampleData={isSampleData}
        accentColor="rose"
      />

      {/* 3. Pending Approvals */}
      <StatCard
        title="Pending Approvals"
        value={metrics.pendingApprovals === 0 && !isSampleData ? '0' : metrics.pendingApprovals}
        subtitle={metrics.pendingApprovals > 0 ? 'awaiting sign-off' : 'queue clear'}
        icon={<Clock className="w-5 h-5" />}
        trend={isSampleData ? metrics.trendApprovals : undefined}
        trendLabel="in review"
        isSampleData={isSampleData}
        accentColor="amber"
      />

      {/* 4. Compliance Rate */}
      <StatCard
        title="Compliance Rate"
        value={metrics.complianceRate === 0 && !isSampleData ? '—' : `${metrics.complianceRate}%`}
        subtitle={metrics.complianceRate > 0 ? 'average score' : 'awaiting first scan'}
        icon={<Award className="w-5 h-5" />}
        trend={isSampleData ? metrics.trendCompliance : undefined}
        trendLabel="improvement"
        isSampleData={isSampleData}
        accentColor="emerald"
      />
    </div>
  );
};
