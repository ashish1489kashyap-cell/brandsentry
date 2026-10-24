'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Trash2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ILLUSTRATIVE_REVIEWS } from '@/lib/mock-data';
import { ApprovalStatus, PublishingChannel, ReviewStatus, StoredReview } from '@/types';
import {
  getStoredReviews,
  updateReviewApproval,
  deleteReview,
  getStoredSettings,
} from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';

export default function ReviewHistoryPage() {
  const { showToast, showRoadmapNotice } = useToast();
  const [mounted, setMounted] = useState(false);
  const [storedReviews, setStoredReviews] = useState<StoredReview[]>([]);
  const [showSampleData, setShowSampleData] = useState(false); // Default to REAL records
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('ALL');
  const [selectedReview, setSelectedReview] = useState<StoredReview | null>(null);
  const [reviewerName, setReviewerName] = useState('Demo Reviewer (Brand Lead)');

  useEffect(() => {
    setMounted(true);
    const loaded = getStoredReviews();
    setStoredReviews(loaded);

    // If user has zero reviews, they can toggle sample data if desired
    const settings = getStoredSettings();
    if (settings.reviewerIdentity) {
      setReviewerName(settings.reviewerIdentity);
    }

    const handleStorageUpdate = () => {
      setStoredReviews(getStoredReviews());
    };
    window.addEventListener('brandsentry:storage-updated', handleStorageUpdate);
    return () => window.removeEventListener('brandsentry:storage-updated', handleStorageUpdate);
  }, []);

  // Determine active dataset: real stored reviews or explicitly labeled sample data
  const baseReviews: StoredReview[] = showSampleData
    ? (ILLUSTRATIVE_REVIEWS as unknown as StoredReview[])
    : storedReviews;

  const filteredReviews = baseReviews.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChannel = channelFilter === 'ALL' || item.channel === channelFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchesApproval = approvalFilter === 'ALL' || item.approvalStatus === approvalFilter;

    return matchesSearch && matchesChannel && matchesStatus && matchesApproval;
  });

  const handleUpdateApproval = (id: string, newStatus: ApprovalStatus) => {
    if (showSampleData) {
      showToast('Sample Record', 'Switch to real stored reviews to update live approval states.', 'info');
      return;
    }

    const updated = updateReviewApproval(id, newStatus, undefined, reviewerName);
    setStoredReviews(updated);
    if (selectedReview && selectedReview.id === id) {
      const refreshed = updated.find(r => r.id === id) || null;
      setSelectedReview(refreshed);
    }

    showToast('Approval Status Updated', `Review ${id} decision marked as ${newStatus}.`, 'success');
  };

  const handleDeleteReview = (id: string) => {
    if (showSampleData) {
      showToast('Sample Record', 'Illustrative sample records cannot be deleted.', 'info');
      return;
    }

    const updated = deleteReview(id);
    setStoredReviews(updated);
    if (selectedReview?.id === id) {
      setSelectedReview(null);
    }
    showToast('Review Removed', `Record ${id} was deleted from storage.`, 'info');
  };

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">Loading Review History...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Review History</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-medium">
              {storedReviews.length} Real Audit Records
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Historical audit log of pre-publication reviews, rule compliance findings, and human governance decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Real vs Sample Mode Toggle */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setShowSampleData(false)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                !showSampleData
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Real Stored ({storedReviews.length})
            </button>
            <button
              onClick={() => setShowSampleData(true)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                showSampleData
                  ? 'bg-slate-800 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sample Data
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={() => showRoadmapNotice('CSV / PDF Audit Trail Export')}
          >
            Export Log
          </Button>

          <Link href="/review">
            <Button variant="primary" size="sm">
              New Review
            </Button>
          </Link>
        </div>
      </div>

      {showSampleData && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-blue-950/40 border border-blue-900/50 text-xs text-blue-300">
          <Info className="w-4 h-4 shrink-0 text-blue-400" />
          <span>
            <strong>Illustrative Benchmark Mode:</strong> Viewing sample historical records. Switch to &ldquo;Real Stored&rdquo; above to view actual reviews created in this session.
          </span>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by ID, title, or copy snippet..."
            className="w-full bg-[#0d1527] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Approval Filter */}
          <select
            value={approvalFilter}
            onChange={e => setApprovalFilter(e.target.value)}
            className="bg-[#0d1527] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Approvals</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
            <option value="REVISED">Revision Requested</option>
          </select>

          {/* Compliance Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0d1527] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Compliance</option>
            <option value="COMPLIANT">Compliant</option>
            <option value="NEEDS_REVISION">Needs Revision</option>
            <option value="FLAGGED">Flagged</option>
          </select>

          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            className="bg-[#0d1527] border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Channels</option>
            <option value="LINKEDIN">LinkedIn</option>
            <option value="TWITTER_X">X (Twitter)</option>
            <option value="BLOG">Blog</option>
            <option value="PRESS_RELEASE">Press Release</option>
            <option value="EMAIL_NEWSLETTER">Email Newsletter</option>
            <option value="AD_COPY">Ad Copy</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table or Empty State */}
      {filteredReviews.length === 0 ? (
        <EmptyState
          icon={<History className="w-6 h-6" />}
          title={showSampleData ? 'No Sample Reviews Matched Filters' : 'No Stored Reviews Yet'}
          description={
            showSampleData
              ? 'Try clearing the search query or status filters.'
              : 'Submit marketing copy in Content Review and click "Save Review" to build an audit history.'
          }
          actionLabel="Run First Review"
          actionHref="/review"
        />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Audit ID & Title</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4">Governance Sign-off</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {filteredReviews.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedReview(item)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 font-bold">{item.id}</span>
                        {item.isSampleData && (
                          <span className="text-[9px] px-1 rounded bg-blue-950 text-blue-400 border border-blue-900/40">
                            Sample
                          </span>
                        )}
                      </div>
                      <div className="font-medium text-slate-200 group-hover:text-blue-400 transition-colors truncate mt-0.5">
                        {item.title}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge channel={item.channel} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge status={item.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <span
                        className={`font-semibold text-xs px-2 py-0.5 rounded ${
                          item.complianceScore >= 85
                            ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                            : item.complianceScore >= 60
                            ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
                            : 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
                        }`}
                      >
                        {item.complianceScore}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Badge approvalStatus={item.approvalStatus || 'PENDING'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                      {new Date(item.submittedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedReview(item);
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-1"
                      >
                        Inspect
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Selected Audit Modal with Human Approval Workflow */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-slate-400 block mb-1">
                  Audit Record: {selectedReview.id}
                </span>
                <h3 className="text-lg font-bold text-white">{selectedReview.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Audited on {new Date(selectedReview.submittedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge channel={selectedReview.channel} size="sm" />
              <Badge status={selectedReview.status} size="sm" />
              <Badge approvalStatus={selectedReview.approvalStatus || 'PENDING'} size="sm" />
              <span className="text-xs text-slate-400 font-medium ml-auto">
                Compliance Score: <strong className="text-white">{selectedReview.complianceScore}/100</strong>
              </span>
            </div>

            {/* Content Snapshot */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Audited Copy Snapshot
              </label>
              <div className="p-3 bg-slate-900 rounded-lg text-xs text-slate-200 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                {selectedReview.content}
              </div>
            </div>

            {/* Findings breakdown */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Violations & Enforcement Findings ({(selectedReview.findings || []).length})
              </label>
              {(!selectedReview.findings || selectedReview.findings.length === 0) ? (
                <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/40 text-emerald-300 text-xs">
                  Clean audit. Content met all brand safety criteria cleanly.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedReview.findings.map(iss => (
                    <div key={iss.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{iss.ruleName || iss.category}</span>
                        <div className="flex items-center gap-1.5">
                          <Badge category={iss.category} size="sm" />
                          <Badge severity={iss.severity} size="sm" />
                        </div>
                      </div>
                      <p className="text-slate-300">{iss.explanation}</p>
                      {iss.matchedText && (
                        <p className="text-rose-300 font-mono text-[11px]">
                          Matched: &ldquo;{iss.matchedText}&rdquo;
                        </p>
                      )}
                      {iss.suggestedCorrection && (
                        <p className="text-emerald-400 text-[11px]">
                          <strong>Recommended:</strong> &ldquo;{iss.suggestedCorrection}&rdquo;
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Human Governance Approval Workflow */}
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Governance Sign-off
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Reviewer Identity: <strong className="text-slate-300">{reviewerName}</strong>
                  </span>
                </div>
                <Badge approvalStatus={selectedReview.approvalStatus || 'PENDING'} size="sm" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={selectedReview.approvalStatus === 'APPROVED' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateApproval(selectedReview.id, 'APPROVED')}
                  disabled={selectedReview.status === 'FLAGGED'}
                  className={selectedReview.status === 'FLAGGED' ? 'opacity-40 cursor-not-allowed' : ''}
                >
                  Approve
                </Button>
                <Button
                  variant={selectedReview.approvalStatus === 'REJECTED' ? 'danger' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateApproval(selectedReview.id, 'REJECTED')}
                >
                  Reject
                </Button>
                <Button
                  variant={selectedReview.approvalStatus === 'REVISED' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => handleUpdateApproval(selectedReview.id, 'REVISED')}
                >
                  Need Revision
                </Button>
              </div>

              <p className="text-[10px] text-slate-500">
                Notice: Approval in BrandSentry certifies brand policy compliance and does NOT publish to external social media or CMS channels.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              {!showSampleData && (
                <button
                  type="button"
                  onClick={() => handleDeleteReview(selectedReview.id)}
                  className="text-xs text-rose-400 hover:text-rose-300 inline-flex items-center gap-1 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>
              )}
              <div className="ml-auto">
                <Button variant="outline" size="sm" onClick={() => setSelectedReview(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
