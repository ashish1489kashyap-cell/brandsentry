'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, ArrowRight, ShieldCheck, ExternalLink } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StoredReview } from '@/types';

interface RecentReviewsProps {
  reviews: StoredReview[];
  isSampleData: boolean;
}

export const RecentReviews: React.FC<RecentReviewsProps> = ({ reviews, isSampleData }) => {
  const [selectedReview, setSelectedReview] = useState<StoredReview | null>(null);

  if (reviews.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader
          title="Recent Content Reviews"
          description="Pre-publication compliance audits and review statuses"
        />
        <EmptyState
          icon={<FileText className="w-6 h-6" />}
          title="No Content Reviews Recorded Yet"
          description="Submit your first marketing copy, social post, or press release to run pre-publication checks against active brand guidelines."
          actionLabel="Run First Review"
          actionHref="/review"
        />
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader
        title={
          <div className="flex items-center gap-2">
            <span>Recent Content Reviews</span>
            {isSampleData && (
              <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/50">
                Illustrative Sample Data
              </span>
            )}
          </div>
        }
        description="Pre-publication compliance audits across publishing channels"
        action={
          <Link href="/history">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />} iconPosition="right">
              View All History
            </Button>
          </Link>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-3">Title & Content Preview</th>
              <th className="py-3 px-3">Channel</th>
              <th className="py-3 px-3">Compliance</th>
              <th className="py-3 px-3 text-center">Score</th>
              <th className="py-3 px-3">Sign-off</th>
              <th className="py-3 px-3 text-center">Findings</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {reviews.map(item => {
              const findingsList = item.findings || item.issues || [];
              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                  onClick={() => setSelectedReview(item)}
                >
                  <td className="py-3.5 px-3 max-w-xs sm:max-w-md">
                    <div className="font-medium text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-400 truncate mt-0.5">
                      {item.content}
                    </div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge channel={item.channel} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge status={item.status} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-center">
                    <span
                      className={`inline-block font-semibold text-xs px-2 py-0.5 rounded ${
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
                  <td className="py-3.5 px-3 whitespace-nowrap">
                    <Badge approvalStatus={item.approvalStatus || 'PENDING'} size="sm" />
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-center">
                    {findingsList.length > 0 ? (
                      <span className="text-xs text-rose-400 font-medium">
                        {findingsList.length} detected
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-400 font-medium flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> None
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap text-right">
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Review Quick Detail Drawer/Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-[#0f172a] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge channel={selectedReview.channel} size="sm" />
                  <Badge status={selectedReview.status} size="sm" />
                  <Badge approvalStatus={selectedReview.approvalStatus || 'PENDING'} size="sm" />
                  {selectedReview.isSampleData && (
                    <span className="text-[10px] text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800/50">
                      Sample Record
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white">{selectedReview.title}</h3>
                <p className="text-xs text-slate-400">ID: {selectedReview.id}</p>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                &times;
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Submitted Content
              </label>
              <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                {selectedReview.content}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Governance Findings ({(selectedReview.findings || selectedReview.issues || []).length})
                </label>
                <span className="text-xs font-semibold text-slate-300">
                  Compliance Score: <span className="text-blue-400">{selectedReview.complianceScore}/100</span>
                </span>
              </div>

              {(selectedReview.findings || selectedReview.issues || []).length === 0 ? (
                <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Content passed all brand rules cleanly with no violations detected.</span>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {(selectedReview.findings || selectedReview.issues || []).map(issue => (
                    <div
                      key={issue.id}
                      className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">
                          {issue.ruleName || issue.category?.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {issue.category && <Badge category={issue.category} size="sm" />}
                          <Badge severity={issue.severity} size="sm" />
                        </div>
                      </div>
                      <p className="text-xs text-slate-300">{issue.explanation}</p>
                      {issue.evidence && (
                        <p className="text-[11px] text-slate-400 italic">
                          Evidence: &ldquo;{issue.evidence}&rdquo;
                        </p>
                      )}
                      {issue.matchedText && (
                        <div className="text-[11px] font-mono p-1 rounded bg-rose-950/40 text-rose-300 border border-rose-900/40">
                          Matched: &ldquo;{issue.matchedText}&rdquo;
                        </div>
                      )}
                      {issue.suggestedCorrection && (
                        <div className="text-xs text-emerald-400 bg-emerald-950/20 p-2 rounded border border-emerald-900/30">
                          <strong className="font-semibold text-emerald-300">Correction: </strong> {issue.suggestedCorrection}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <Link href="/history">
                <Button variant="ghost" size="sm">
                  Go to Full Audit History &rarr;
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setSelectedReview(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
