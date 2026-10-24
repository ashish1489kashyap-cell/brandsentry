'use client';

import React, { useState } from 'react';
import {
  Check,
  Save,
  Trash2,
  RotateCcw,
  Shield,
} from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { PlatformSettings } from '@/types';
import {
  saveStoredSettings,
  clearAllStoredReviews,
  resetRulesToDefault,
  usePlatformSettings,
  useBrandRules,
  useStoredReviews,
} from '@/lib/storage';

interface SettingsFormProps {
  initialSettings: PlatformSettings;
  rulesCount: number;
  reviewsCount: number;
  onResetRules: () => void;
  onClearReviews: () => void;
}

function SettingsForm({
  initialSettings,
  rulesCount,
  reviewsCount,
  onResetRules,
  onClearReviews,
}: SettingsFormProps) {
  const { showToast } = useToast();

  // Form states
  const [orgName, setOrgName] = useState(initialSettings.orgName);
  const [minComplianceScore, setMinComplianceScore] = useState(initialSettings.minComplianceScore);
  const [strictMode, setStrictMode] = useState(initialSettings.strictMode);
  const [autoBlockCritical, setAutoBlockCritical] = useState(initialSettings.autoBlockCritical);
  const [reviewerIdentity, setReviewerIdentity] = useState(initialSettings.reviewerIdentity);
  const [emailAlerts, setEmailAlerts] = useState(initialSettings.emailAlerts);
  const [slackWebhook, setSlackWebhook] = useState(initialSettings.slackWebhook || '');

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveStoredSettings({
      orgName,
      minComplianceScore,
      strictMode,
      autoBlockCritical,
      reviewerIdentity,
      emailAlerts,
      slackWebhook,
    });
    showToast('Settings Saved', 'Platform configuration successfully persisted in browser storage.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Platform Settings</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-medium">
              Governance & Policies
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Configure governance thresholds, reviewer identity, rule enforcement strictness, and storage tools.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          onClick={() => handleSaveSettings()}
        >
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* 1. Governance & Compliance Thresholds */}
        <Card>
          <CardHeader
            title="Governance Policies & Thresholds"
            description="Control publication gate thresholds and automated blocking logic"
          />

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Organization / Brand Workspace Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Human Reviewer Identity Label
              </label>
              <input
                type="text"
                value={reviewerIdentity}
                onChange={e => setReviewerIdentity(e.target.value)}
                placeholder="e.g. Lead Brand Editor"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Recorded alongside approval and rejection decisions in the audit trail.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Minimum Publishing Compliance Score
                </label>
                <span className="text-xs font-mono font-bold text-blue-400">
                  {minComplianceScore} / 100
                </span>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={5}
                value={minComplianceScore}
                onChange={e => setMinComplianceScore(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Content scoring below this threshold will be flagged as requiring editorial revision.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoBlockCritical}
                  onChange={e => setAutoBlockCritical(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 mt-0.5"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Strict Auto-Block on Critical Violations
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Immediately prevents human approval whenever an unbacked absolute claim or critical policy breach is detected.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={strictMode}
                  onChange={e => setStrictMode(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 mt-0.5"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Enforce Exact Trademark Casing Check
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Require standard camel-case capitalization for registered trademarks (e.g. BrandSentry™).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={e => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-700 text-blue-600 focus:ring-0 mt-0.5"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">
                    Email Digest Notifications
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Send daily summary of pending approvals and rejected publications to the brand governance team.
                  </span>
                </div>
              </label>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Optional Audit Webhook URL
                </label>
                <input
                  type="url"
                  value={slackWebhook}
                  onChange={e => setSlackWebhook(e.target.value)}
                  placeholder="https://hooks.slack.com/services/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Optional webhook endpoint for real-time compliance alert events.
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* 2. Review Engine Architecture */}
        <Card>
          <CardHeader
            title="Review Engine Architecture"
            description="Pure deterministic, locally executable rule-based review engine"
          />

          <div className="space-y-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Shield className="w-4 h-4" />
                Deterministic Local Execution Active
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                BrandSentry executes rule evaluations locally in your browser. It does not send content to third-party language models or require paid API keys. All checks are fully explainable and reproducible against configured Brand Vault policies.
              </p>
            </div>
          </div>
        </Card>

        {/* 3. Persistence & Local Storage Maintenance */}
        <Card>
          <CardHeader
            title="Local Storage & Demo Data Maintenance"
            description="Manage client-side persistence records for the hackathon demo"
          />

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Brand Vault Rules Stored</span>
                <span className="text-xl font-bold text-white">{rulesCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 block mb-1">Reviews Stored in History</span>
                <span className="text-xl font-bold text-white">{reviewsCount}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                icon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={onResetRules}
              >
                Reset Brand Vault to Defaults
              </Button>

              <Button
                variant="danger"
                size="sm"
                type="button"
                icon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={onClearReviews}
                disabled={reviewsCount === 0}
              >
                Clear All Saved Reviews
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" size="md" type="submit" icon={<Check className="w-4 h-4" />}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  const { showToast } = useToast();
  const settings = usePlatformSettings();
  const rules = useBrandRules();
  const reviews = useStoredReviews();

  const handleClearReviews = () => {
    if (window.confirm('Delete all saved reviews in local storage? This action cannot be undone.')) {
      clearAllStoredReviews();
      showToast('Reviews Cleared', 'Stored review records have been wiped clean.', 'info');
    }
  };

  const handleResetRules = () => {
    if (window.confirm('Restore Brand Vault rules to the original demo rules profile?')) {
      resetRulesToDefault();
      showToast('Rules Reset', 'Brand Vault restored to standard demo rules.', 'success');
    }
  };

  return (
    <SettingsForm
      key={settings.orgName + '-' + settings.minComplianceScore + '-' + settings.reviewerIdentity}
      initialSettings={settings}
      rulesCount={rules.length}
      reviewsCount={reviews.length}
      onResetRules={handleResetRules}
      onClearReviews={handleClearReviews}
    />
  );
}
