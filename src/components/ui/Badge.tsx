import React from 'react';
import { ApprovalStatus, PublishingChannel, ReviewStatus, RuleCategory, Severity } from '@/types';

export interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'status' | 'severity' | 'channel' | 'approval' | 'category' | 'neutral' | 'accent';
  status?: ReviewStatus;
  severity?: Severity;
  channel?: PublishingChannel;
  approvalStatus?: ApprovalStatus;
  category?: RuleCategory;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  status,
  severity,
  channel,
  approvalStatus,
  category,
  className = '',
  size = 'md',
}) => {
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (approvalStatus) {
    const approvalConfig: Record<ApprovalStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
      APPROVED: {
        label: 'Approved (BrandSentry)',
        bg: 'bg-emerald-950/70',
        text: 'text-emerald-300',
        border: 'border-emerald-800/80',
        dot: 'bg-emerald-400',
      },
      REJECTED: {
        label: 'Publication Rejected',
        bg: 'bg-rose-950/70',
        text: 'text-rose-300',
        border: 'border-rose-800/80',
        dot: 'bg-rose-400',
      },
      REVISED: {
        label: 'Revision Requested',
        bg: 'bg-amber-950/70',
        text: 'text-amber-300',
        border: 'border-amber-800/80',
        dot: 'bg-amber-400',
      },
      PENDING: {
        label: 'Pending Human Sign-off',
        bg: 'bg-blue-950/70',
        text: 'text-blue-300',
        border: 'border-blue-800/80',
        dot: 'bg-blue-400',
      },
    };

    const config = approvalConfig[approvalStatus];
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClass} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {children || config.label}
      </span>
    );
  }

  if (status) {
    const statusConfig: Record<ReviewStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
      COMPLIANT: {
        label: 'Compliant',
        bg: 'bg-emerald-950/60',
        text: 'text-emerald-400',
        border: 'border-emerald-800/60',
        dot: 'bg-emerald-400',
      },
      FLAGGED: {
        label: 'Flagged Issues',
        bg: 'bg-rose-950/60',
        text: 'text-rose-400',
        border: 'border-rose-800/60',
        dot: 'bg-rose-400',
      },
      NEEDS_REVISION: {
        label: 'Needs Revision',
        bg: 'bg-amber-950/60',
        text: 'text-amber-400',
        border: 'border-amber-800/60',
        dot: 'bg-amber-400',
      },
    };

    const config = statusConfig[status] || {
      label: status,
      bg: 'bg-slate-900',
      text: 'text-slate-300',
      border: 'border-slate-800',
      dot: 'bg-slate-400',
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClass} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
        {children || config.label}
      </span>
    );
  }

  if (severity) {
    const severityConfig: Record<Severity, { label: string; bg: string; text: string; border: string }> = {
      CRITICAL: {
        label: 'Critical',
        bg: 'bg-rose-950/80',
        text: 'text-rose-300',
        border: 'border-rose-800',
      },
      WARNING: {
        label: 'Warning',
        bg: 'bg-amber-950/80',
        text: 'text-amber-300',
        border: 'border-amber-800',
      },
      INFO: {
        label: 'Informational',
        bg: 'bg-blue-950/80',
        text: 'text-blue-300',
        border: 'border-blue-800',
      },
    };

    const config = severityConfig[severity];
    return (
      <span
        className={`inline-flex items-center font-medium rounded border ${config.bg} ${config.text} ${config.border} ${sizeClass} ${className}`}
      >
        {children || config.label}
      </span>
    );
  }

  if (category) {
    const categoryLabels: Record<RuleCategory, string> = {
      PROHIBITED_PHRASE: 'Prohibited Phrase',
      REQUIRED_TERMINOLOGY: 'Required Terminology',
      APPROVED_CLAIM: 'Approved Claim',
      TONE_VOICE: 'Tone & Voice',
      OTHER: 'Policy Rule',
    };

    return (
      <span
        className={`inline-flex items-center font-medium rounded bg-slate-800/90 text-slate-300 border border-slate-700/80 ${sizeClass} ${className}`}
      >
        {children || categoryLabels[category]}
      </span>
    );
  }

  if (channel) {
    const channelNames: Record<PublishingChannel, string> = {
      TWITTER_X: 'X (Twitter)',
      LINKEDIN: 'LinkedIn',
      INSTAGRAM: 'Instagram',
      BLOG: 'Blog Post',
      PRESS_RELEASE: 'Press Release',
      EMAIL_NEWSLETTER: 'Email Newsletter',
      AD_COPY: 'Ad Copy',
    };

    return (
      <span
        className={`inline-flex items-center font-medium rounded-md bg-slate-800/80 text-slate-300 border border-slate-700 ${sizeClass} ${className}`}
      >
        {children || channelNames[channel]}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700 ${sizeClass} ${className}`}
    >
      {children}
    </span>
  );
};
