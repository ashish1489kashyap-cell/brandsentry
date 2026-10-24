'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSearch,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  Check,
  XCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  ApprovalStatus,
  BrandRule,
  PublishingChannel,
  ReviewFinding,
  StoredReview,
} from '@/types';
import {
  runContentReview,
  ReviewEngineResult,
  applyTargetedCorrection,
} from '@/lib/engine/reviewer';
import {
  getStoredRules,
  getStoredSettings,
  saveReview,
} from '@/lib/storage';
import { useToast } from '@/components/ui/Toast';

export default function ContentReviewPage() {
  const { showToast, showRoadmapNotice } = useToast();

  const [rules, setRules] = useState<BrandRule[]>([]);
  const [mounted, setMounted] = useState(false);

  // Draft form
  const [title, setTitle] = useState('Q4 Enterprise Product Launch Announcement');
  const [channel, setChannel] = useState<PublishingChannel>('LINKEDIN');
  const [content, setContent] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [appliedCount, setAppliedCount] = useState(0);

  // Review & Storage state
  const [scanResult, setScanResult] = useState<ReviewEngineResult | null>(null);
  const [savedReviewId, setSavedReviewId] = useState<string | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('PENDING');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [reviewerName, setReviewerName] = useState('Demo Reviewer (Brand Lead)');

  useEffect(() => {
    setMounted(true);
    setRules(getStoredRules());
    const settings = getStoredSettings();
    if (settings.reviewerIdentity) {
      setReviewerName(settings.reviewerIdentity);
    }
  }, []);

  const sampleViolationsText =
    'Announcing Brand Sentry 2.0! We provide a 100% guaranteed zero downtime deployment with tripled ROI for enterprise marketing teams. Competitors are clueless about real brand governance.';

  const sampleCompliantText =
    'BrandSentry enables enterprise teams to maintain brand consistency and compliance across every external channel. Engineered for high reliability with audited workflows. Results may vary based on deployment scale.';

  const handleLoadSample = (type: 'violations' | 'compliant') => {
    if (type === 'violations') {
      setTitle('Q4 Enterprise Product Blast');
      setChannel('LINKEDIN');
      setContent(sampleViolationsText);
      setScanResult(null);
      setSavedReviewId(null);
      setAppliedCount(0);
      setApprovalStatus('PENDING');
      showToast('Sample Loaded', 'Draft loaded with intentional trademark, claim, and tone violations.', 'info');
    } else {
      setTitle('Executive Brand Governance Memo');
      setChannel('BLOG');
      setContent(sampleCompliantText);
      setScanResult(null);
      setSavedReviewId(null);
      setAppliedCount(0);
      setApprovalStatus('PENDING');
      showToast('Sample Loaded', 'Clean compliant brand copy loaded.', 'success');
    }
  };

  const handleRunReview = () => {
    if (!content.trim()) {
      showToast('Input Required', 'Please enter or paste draft marketing copy to evaluate.', 'warning');
      return;
    }

    setIsScanning(true);

    setTimeout(() => {
      // Evaluate against the latest stored Brand Vault rules
      const currentRules = getStoredRules();
      setRules(currentRules);

      const result = runContentReview(content, currentRules, channel);
      setScanResult(result);
      setIsScanning(false);

      if (savedReviewId) {
        // If already saved, update review record
        const updatedReview: StoredReview = {
          id: savedReviewId,
          title: title || 'Untitled Review',
          content,
          channel,
          status: result.status,
          complianceScore: result.complianceScore,
          submittedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          findings: result.findings,
          approvalStatus,
          appliedCorrectionsCount: appliedCount,
        };
        saveReview(updatedReview);
      }

      showToast(
        'Review Completed',
        `Rule-based scan evaluated ${result.activeRulesCount} active rules. Score: ${result.complianceScore}%.`,
        result.status === 'COMPLIANT' ? 'success' : result.status === 'FLAGGED' ? 'warning' : 'info'
      );
    }, 250);
  };

  const handleApplyCorrection = (finding: ReviewFinding) => {
    if (!finding.suggestedCorrection) return;

    const { updatedContent, applied } = applyTargetedCorrection(
      content,
      finding.matchedText,
      finding.suggestedCorrection
    );

    if (applied) {
      setContent(updatedContent);
      setAppliedCount(prev => prev + 1);
      showToast(
        'Correction Applied',
        `Replaced "${finding.matchedText}" with "${finding.suggestedCorrection}". Re-run review to update compliance score.`,
        'success'
      );
    } else {
      showToast('Notice', 'Could not locate matching phrase in text. It may have already been modified.', 'info');
    }
  };

  const handleSaveToHistory = (customApproval?: ApprovalStatus) => {
    if (!scanResult) {
      showToast('Scan Required', 'Please run a governance review before saving to history.', 'warning');
      return;
    }

    const reviewId = savedReviewId || `REV-${Date.now().toString(36).toUpperCase()}`;
    const effectiveApproval = customApproval || approvalStatus;

    const reviewToSave: StoredReview = {
      id: reviewId,
      title: title.trim() || 'Untitled Content Review',
      content,
      channel,
      status: scanResult.status,
      complianceScore: scanResult.complianceScore,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      findings: scanResult.findings,
      approvalStatus: effectiveApproval,
      approvalDecision: {
        status: effectiveApproval,
        timestamp: new Date().toISOString(),
        reviewer: reviewerName,
        notes: approvalNotes || undefined,
      },
      appliedCorrectionsCount: appliedCount,
    };

    saveReview(reviewToSave);
    setSavedReviewId(reviewId);
    setApprovalStatus(effectiveApproval);

    showToast(
      'Saved to Audit History',
      `Review ${reviewId} is persisted with status: ${effectiveApproval}.`,
      'success'
    );
  };

  const handleApprovalAction = (newStatus: ApprovalStatus) => {
    setApprovalStatus(newStatus);
    if (scanResult) {
      handleSaveToHistory(newStatus);
    } else {
      showToast('Status Updated', `Approval decision marked as ${newStatus}.`, 'info');
    }
  };

  const handleClear = () => {
    setTitle('Untitled Content Draft');
    setContent('');
    setScanResult(null);
    setSavedReviewId(null);
    setAppliedCount(0);
    setApprovalStatus('PENDING');
    showToast('Reset', 'Form cleared.', 'info');
  };

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">Loading Review Engine...</div>;
  }

  const activeRulesCount = rules.filter(r => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Content Review</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-medium">
              Deterministic Rule Engine &bull; {activeRulesCount} Active Rules
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Pre-publication governance review. Evaluates text strictly against Brand Vault rules with exact evidence tracking.
          </p>
        </div>

        {/* Preset Sample Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLoadSample('violations')}
          >
            Load Draft with Violations
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleLoadSample('compliant')}
          >
            Load Compliant Draft
          </Button>
        </div>
      </div>

      {/* Main Review Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Draft Input & Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card>
            <CardHeader
              title="Content Submission"
              description="Draft details and destination publishing channel"
              action={
                savedReviewId && (
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                    Saved: {savedReviewId}
                  </span>
                )
              }
            />

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Draft Title / Campaign Reference
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Launch Announcement"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Publishing Channel
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      ['LINKEDIN', 'LinkedIn'],
                      ['TWITTER_X', 'X (Twitter)'],
                      ['BLOG', 'Blog Post'],
                      ['PRESS_RELEASE', 'Press Release'],
                      ['EMAIL_NEWSLETTER', 'Email Newsletter'],
                      ['AD_COPY', 'Ad Copy'],
                    ] as const
                  ).map(([chKey, chLabel]) => (
                    <button
                      key={chKey}
                      type="button"
                      onClick={() => setChannel(chKey)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-all ${
                        channel === chKey
                          ? 'bg-blue-600/20 text-blue-400 border-blue-500/50 shadow-sm'
                          : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {chLabel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Marketing Copy / Draft Text
                  </label>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                    <span>{content.length} chars</span>
                    <span>&bull;</span>
                    <span>{content.trim() ? content.trim().split(/\s+/).length : 0} words</span>
                    {appliedCount > 0 && (
                      <span className="text-emerald-400 font-sans">
                        ({appliedCount} fix{appliedCount > 1 ? 'es' : ''} applied)
                      </span>
                    )}
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Paste or type marketing copy, announcements, or disclaimers here to test against Brand Vault rules..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors leading-relaxed font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Clear
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleRunReview}
                    disabled={isScanning || !content.trim()}
                    icon={isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  >
                    {isScanning ? 'Analyzing Rules...' : scanResult ? 'Re-run Review' : 'Run Governance Review'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Transparent Scoring Formula Documentation Card */}
          <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1527] text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>Transparent Governance Scoring Formula</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              BrandSentry uses a deterministic deduction model on a 0–100 scale:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-rose-300">
                <strong>Critical Violation:</strong> -25 points (Blocks publishing)
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-amber-300">
                <strong>Warning Deviation:</strong> -10 points (Editorial review recommended)
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-blue-300">
                <strong>Informational:</strong> -3 points (Advisory guidance)
              </div>
            </div>
            <p className="text-[10px] text-slate-500">
              Score &ge; 85 with 0 Critical violations qualifies for Compliant status. Zero violations always yields 100%.
            </p>
          </div>
        </div>

        {/* Right Panel: Pre-Publication Audit Results & Approval (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader
              title="Compliance Diagnostics"
              description="Real-time rule-based validation against Brand Vault"
            />

            {!scanResult ? (
              <div className="py-12 px-4 text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mb-3">
                  <FileSearch className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">Awaiting Content Review</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 leading-relaxed">
                  Enter copy on the left or click &ldquo;Load Draft with Violations&rdquo; to test against configured brand rules.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score Summary Box */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block font-medium">
                      Compliance Rating
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span
                        className={`text-3xl font-extrabold ${
                          scanResult.complianceScore >= 85
                            ? 'text-emerald-400'
                            : scanResult.complianceScore >= 60
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {scanResult.complianceScore}
                      </span>
                      <span className="text-xs text-slate-500">/ 100</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge status={scanResult.status} size="md" />
                    <p className="text-[10px] text-slate-500 mt-1 font-mono">
                      ID: {scanResult.scanId}
                    </p>
                  </div>
                </div>

                {/* Severity Breakdown Pills */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-900/40 text-rose-300">
                    <span className="font-bold block text-sm">{scanResult.severityBreakdown.critical}</span>
                    <span className="text-[10px] uppercase font-medium">Critical</span>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-950/30 border border-amber-900/40 text-amber-300">
                    <span className="font-bold block text-sm">{scanResult.severityBreakdown.warning}</span>
                    <span className="text-[10px] uppercase font-medium">Warnings</span>
                  </div>
                  <div className="p-2 rounded-lg bg-blue-950/30 border border-blue-900/40 text-blue-300">
                    <span className="font-bold block text-sm">{scanResult.severityBreakdown.info}</span>
                    <span className="text-[10px] uppercase font-medium">Advisory</span>
                  </div>
                </div>

                {/* Findings List with Evidence & One-Click Fix */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Detected Findings ({scanResult.findings.length})
                    </h5>
                    <span className="text-[11px] text-slate-500">
                      Evaluated against {scanResult.activeRulesCount} active rules
                    </span>
                  </div>

                  {scanResult.findings.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-emerald-200">100% Brand Compliant</p>
                        <p className="text-emerald-400/80 mt-0.5">
                          Zero prohibited phrases, unapproved claims, or tone deviations detected.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {scanResult.findings.map(finding => (
                        <div
                          key={finding.id}
                          className="p-3.5 rounded-xl border border-slate-800 bg-slate-900 space-y-2 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="font-semibold text-slate-200 block">
                                {finding.ruleName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                Rule ID: {finding.ruleId}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge category={finding.category} size="sm" />
                              <Badge severity={finding.severity} size="sm" />
                            </div>
                          </div>

                          <p className="text-slate-300 leading-relaxed">{finding.explanation}</p>

                          {/* Evidence Context Block */}
                          <div className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                            <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                              Evidence in Context:
                            </span>
                            <p className="text-slate-300 italic">
                              &ldquo;{finding.evidence}&rdquo;
                            </p>
                            <div className="font-mono text-rose-300 pt-0.5">
                              Matched text: <span className="bg-rose-950/60 px-1 py-0.5 rounded border border-rose-900/60 font-bold">&ldquo;{finding.matchedText}&rdquo;</span>
                            </div>
                          </div>

                          {/* Targeted Suggested Fix */}
                          {finding.suggestedCorrection && (
                            <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="text-emerald-400 text-[11px]">
                                <span className="font-semibold text-emerald-300">Suggested Fix: </span>
                                &ldquo;{finding.suggestedCorrection}&rdquo;
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApplyCorrection(finding)}
                                className="text-xs py-1 text-emerald-300 hover:text-emerald-200 border-emerald-800/60 hover:bg-emerald-950/50"
                              >
                                Apply Fix
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 5: Human Approval Workflow */}
                <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1424] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-semibold text-slate-200">
                        Human Governance Decision
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Reviewer: <span className="text-slate-200 font-medium">{reviewerName}</span>
                      </p>
                    </div>
                    <Badge approvalStatus={approvalStatus} size="sm" />
                  </div>

                  {/* Decision Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={approvalStatus === 'APPROVED' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleApprovalAction('APPROVED')}
                      disabled={scanResult.status === 'FLAGGED'}
                      icon={<Check className="w-3.5 h-3.5" />}
                      className={
                        scanResult.status === 'FLAGGED'
                          ? 'opacity-40 cursor-not-allowed'
                          : approvalStatus === 'APPROVED'
                          ? 'bg-emerald-600 hover:bg-emerald-500 border-emerald-500'
                          : ''
                      }
                      title={
                        scanResult.status === 'FLAGGED'
                          ? 'Resolve Critical violations before approving'
                          : 'Approve in BrandSentry'
                      }
                    >
                      Approve
                    </Button>

                    <Button
                      variant={approvalStatus === 'REJECTED' ? 'danger' : 'outline'}
                      size="sm"
                      onClick={() => handleApprovalAction('REJECTED')}
                      icon={<XCircle className="w-3.5 h-3.5" />}
                    >
                      Reject
                    </Button>

                    <Button
                      variant={approvalStatus === 'REVISED' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => handleApprovalAction('REVISED')}
                    >
                      Need Revision
                    </Button>
                  </div>

                  {scanResult.status === 'FLAGGED' && (
                    <p className="text-[10px] text-rose-400 bg-rose-950/40 p-1.5 rounded border border-rose-900/40">
                      Approval blocked: content has Critical brand policy violations. Apply fixes or edit copy to proceed.
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">
                      Approval is internal to BrandSentry. Not published externally.
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<Save className="w-3.5 h-3.5" />}
                      onClick={() => handleSaveToHistory()}
                    >
                      {savedReviewId ? 'Update Record' : 'Save Review'}
                    </Button>
                  </div>
                </div>

                {savedReviewId && (
                  <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/40 text-xs flex items-center justify-between text-blue-300">
                    <span>Record persisted in Review History.</span>
                    <Link
                      href="/history"
                      className="font-medium inline-flex items-center gap-1 hover:text-white"
                    >
                      View in History
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
