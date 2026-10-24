import { BrandRule, DashboardMetrics, StoredReview } from '@/types';
import { INITIAL_DEMO_RULES } from '@/lib/engine/rules';

/**
 * Benchmark illustrative metrics.
 * Note: These are explicitly labeled as illustrative sample data for hackathon evaluation.
 */
export const ILLUSTRATIVE_METRICS: DashboardMetrics = {
  totalReviews: 48,
  detectedIssues: 14,
  pendingApprovals: 3,
  complianceRate: 92.4,
  trendReviews: 15.2,
  trendIssues: -21.4,
  trendApprovals: 0,
  trendCompliance: 4.8,
};

export const EMPTY_METRICS: DashboardMetrics = {
  totalReviews: 0,
  detectedIssues: 0,
  pendingApprovals: 0,
  complianceRate: 0,
  trendReviews: 0,
  trendIssues: 0,
  trendApprovals: 0,
  trendCompliance: 0,
};

export const ILLUSTRATIVE_REVIEWS: StoredReview[] = [
  {
    id: 'REV-SAMPLE-001',
    title: 'Q3 Enterprise Product Launch Announcement',
    content: 'We are thrilled to unveil BrandSentry 2.0 with 100% guaranteed zero downtime and doubled ROI for marketing teams.',
    channel: 'LINKEDIN',
    status: 'FLAGGED',
    complianceScore: 65,
    submittedAt: '2026-10-24T09:30:00Z',
    updatedAt: '2026-10-24T09:30:00Z',
    approvalStatus: 'REJECTED',
    isSampleData: true,
    approvalDecision: {
      status: 'REJECTED',
      timestamp: '2026-10-24T09:35:00Z',
      reviewer: 'Demo Reviewer (Brand Lead)',
      notes: 'Contains critical warranty claims without safe-harbor footnote.',
    },
    findings: [
      {
        id: 'FINDING-SAMPLE-01',
        ruleId: 'DEMO-RULE-001',
        ruleName: 'Unsupported Absolute Claim: "Guaranteed Results"',
        category: 'APPROVED_CLAIM',
        severity: 'CRITICAL',
        matchedText: '100% guaranteed',
        evidence: 'We are thrilled to unveil BrandSentry 2.0 with 100% guaranteed zero downtime and doubled ROI for marketing teams.',
        explanation: 'Unsubstantiated absolute claim "100% guaranteed" violates corporate policy.',
        suggestedCorrection: 'engineered for high reliability',
      },
      {
        id: 'FINDING-SAMPLE-02',
        ruleId: 'DEMO-RULE-004',
        ruleName: 'Financial & ROI Claim Qualification',
        category: 'APPROVED_CLAIM',
        severity: 'WARNING',
        matchedText: 'doubled ROI',
        evidence: 'We are thrilled to unveil BrandSentry 2.0 with 100% guaranteed zero downtime and doubled ROI for marketing teams.',
        explanation: 'Financial claim without disclaimer.',
        suggestedCorrection: 'measurable ROI benchmark (see case study)',
      },
    ],
  },
  {
    id: 'REV-SAMPLE-002',
    title: 'Executive Thought Leadership: Modern Brand Safety',
    content: 'In modern multi-channel publishing, brand consistency is the difference between durable trust and costly PR crises.',
    channel: 'BLOG',
    status: 'COMPLIANT',
    complianceScore: 100,
    submittedAt: '2026-10-23T16:15:00Z',
    updatedAt: '2026-10-23T16:20:00Z',
    approvalStatus: 'APPROVED',
    isSampleData: true,
    approvalDecision: {
      status: 'APPROVED',
      timestamp: '2026-10-23T16:20:00Z',
      reviewer: 'Demo Reviewer (Brand Lead)',
    },
    findings: [],
  },
  {
    id: 'REV-SAMPLE-003',
    title: 'Black Friday Campaign Social Teaser',
    content: 'Get ready for our biggest platform upgrade ever. Competitors are clueless about what we are shipping tomorrow.',
    channel: 'TWITTER_X',
    status: 'NEEDS_REVISION',
    complianceScore: 80,
    submittedAt: '2026-10-23T11:45:00Z',
    updatedAt: '2026-10-23T11:45:00Z',
    approvalStatus: 'REVISED',
    isSampleData: true,
    approvalDecision: {
      status: 'REVISED',
      timestamp: '2026-10-23T11:50:00Z',
      reviewer: 'Demo Reviewer (Brand Lead)',
      notes: 'Please soften tone regarding competitors.',
    },
    findings: [
      {
        id: 'FINDING-SAMPLE-03',
        ruleId: 'DEMO-RULE-003',
        ruleName: 'Prohibited Combative Phrasing: "Competitors are Clueless"',
        category: 'PROHIBITED_PHRASE',
        severity: 'WARNING',
        matchedText: 'Competitors are clueless',
        evidence: 'Competitors are clueless about what we are shipping tomorrow.',
        explanation: 'Combative tone detected.',
        suggestedCorrection: 'alternative market options',
      },
    ],
  },
  {
    id: 'REV-SAMPLE-004',
    title: 'Customer Advisory Board Invitation Newsletter',
    content: 'Exclusive invitation for select enterprise customers to review the 2026 brand governance roadmap.',
    channel: 'EMAIL_NEWSLETTER',
    status: 'COMPLIANT',
    complianceScore: 97,
    submittedAt: '2026-10-22T14:20:00Z',
    updatedAt: '2026-10-22T14:20:00Z',
    approvalStatus: 'PENDING',
    isSampleData: true,
    findings: [],
  },
];

export const INITIAL_BRAND_GUIDELINES: BrandRule[] = INITIAL_DEMO_RULES;
