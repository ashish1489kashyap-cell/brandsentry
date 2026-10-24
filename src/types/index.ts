export type Severity = 'CRITICAL' | 'WARNING' | 'INFO';

export type ReviewStatus = 'COMPLIANT' | 'NEEDS_REVISION' | 'FLAGGED';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISED';

export type PublishingChannel =
  | 'TWITTER_X'
  | 'LINKEDIN'
  | 'INSTAGRAM'
  | 'BLOG'
  | 'PRESS_RELEASE'
  | 'EMAIL_NEWSLETTER'
  | 'AD_COPY';

export type RuleCategory =
  | 'PROHIBITED_PHRASE'
  | 'REQUIRED_TERMINOLOGY'
  | 'APPROVED_CLAIM'
  | 'TONE_VOICE'
  | 'OTHER';

export interface BrandRule {
  id: string;
  name: string;
  category: RuleCategory;
  description: string;
  severity: Severity;
  matchPhrase: string; // The target phrase or pattern to detect (comma-separated if multiple variations)
  targetTerm?: string; // For required terminology: the official approved term
  suggestedCorrection?: string; // Optional recommended replacement
  enabled: boolean;
  isExample?: boolean; // Distinguishes initial demo rules from user-created rules
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFinding {
  id: string;
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  severity: Severity;
  matchedText: string;
  evidence: string; // The exact sentence or surrounding context where the match occurred
  explanation: string;
  suggestedCorrection?: string;
  startIndex?: number;
  endIndex?: number;
}

export interface ApprovalDecision {
  status: ApprovalStatus;
  timestamp: string;
  reviewer: string;
  notes?: string;
}

export interface StoredReview {
  id: string;
  title: string;
  content: string;
  channel: PublishingChannel;
  status: ReviewStatus;
  complianceScore: number; // 0 to 100
  submittedAt: string;
  updatedAt?: string;
  findings: ReviewFinding[];
  issues?: ReviewFinding[];
  approvalStatus: ApprovalStatus;
  approvalDecision?: ApprovalDecision;
  appliedCorrectionsCount?: number;
  isSampleData?: boolean;
}

// Legacy alias for compatibility with Phase 1 components
export type ContentReviewItem = StoredReview;
export type ReviewIssue = ReviewFinding;
export type BrandGuideline = BrandRule;

export interface DashboardMetrics {
  totalReviews: number;
  detectedIssues: number;
  pendingApprovals: number;
  complianceRate: number; // percentage e.g. 94.2
  trendReviews?: number;
  trendIssues?: number;
  trendApprovals?: number;
  trendCompliance?: number;
}

export interface PlatformSettings {
  orgName: string;
  minComplianceScore: number;
  strictMode: boolean;
  autoBlockCritical: boolean;
  reviewerIdentity: string;
  emailAlerts: boolean;
  slackWebhook: string;
}
