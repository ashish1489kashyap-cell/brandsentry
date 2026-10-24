import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  runContentReview,
  calculateComplianceScore,
  deriveReviewStatus,
  applyTargetedCorrection,
  calculateRealMetrics,
} from '../src/lib/engine/reviewer.ts';

import { INITIAL_DEMO_RULES } from '../src/lib/engine/rules.ts';

describe('BrandSentry Review Engine & Scoring Tests', () => {
  it('1. Returns 100% compliance on empty content without phantom violations', () => {
    const result = runContentReview('', INITIAL_DEMO_RULES, 'LINKEDIN');
    assert.equal(result.complianceScore, 100);
    assert.equal(result.status, 'COMPLIANT');
    assert.equal(result.findings.length, 0);
  });

  it('2. Correctly flags prohibited absolute claims with exact evidence and explanation', () => {
    const text = 'Announcing our new deployment. We offer 100% guaranteed zero downtime for our cloud customers.';
    const result = runContentReview(text, INITIAL_DEMO_RULES, 'LINKEDIN');

    assert.ok(result.findings.length > 0);
    const claimFinding = result.findings.find(f => f.ruleId === 'DEMO-RULE-001');
    assert.ok(claimFinding, 'DEMO-RULE-001 must be triggered');
    assert.equal(claimFinding.severity, 'CRITICAL');
    assert.equal(claimFinding.matchedText.toLowerCase(), '100% guaranteed');
    assert.ok(claimFinding.evidence.includes('We offer 100% guaranteed zero downtime'));
    assert.ok(claimFinding.explanation.length > 0);
    assert.equal(claimFinding.suggestedCorrection, 'engineered for high reliability');
  });

  it('3. Flags required terminology violations (e.g. Brand Sentry vs BrandSentry)', () => {
    const text = 'Welcome to the new release from Brand Sentry enterprise.';
    const result = runContentReview(text, INITIAL_DEMO_RULES, 'BLOG');

    const termFinding = result.findings.find(f => f.ruleId === 'DEMO-RULE-002');
    assert.ok(termFinding, 'DEMO-RULE-002 must trigger on "Brand Sentry"');
    assert.equal(termFinding.severity, 'WARNING');
    assert.equal(termFinding.matchedText, 'Brand Sentry');
    assert.equal(termFinding.suggestedCorrection, 'BrandSentry™');
  });

  it('4. Correctly calculates transparent score deductions', () => {
    // 1 Critical (-25) + 1 Warning (-10) = 65%
    const findings = [
      {
        id: 'F1',
        ruleId: 'DEMO-RULE-001',
        ruleName: 'Claim',
        category: 'APPROVED_CLAIM',
        severity: 'CRITICAL',
        matchedText: '100% guaranteed',
        evidence: '...',
        explanation: '...',
      },
      {
        id: 'F2',
        ruleId: 'DEMO-RULE-003',
        ruleName: 'Tone',
        category: 'PROHIBITED_PHRASE',
        severity: 'WARNING',
        matchedText: 'competitors are clueless',
        evidence: '...',
        explanation: '...',
      },
    ];

    const { score, deductions, breakdown } = calculateComplianceScore(findings);
    assert.equal(deductions, 35);
    assert.equal(score, 65);
    assert.equal(breakdown.critical, 1);
    assert.equal(breakdown.warning, 1);
    assert.equal(breakdown.info, 0);

    const status = deriveReviewStatus(score, findings);
    assert.equal(status, 'FLAGGED'); // Critical violation forces FLAGGED status
  });

  it('5. Supports targeted 1-click phrase correction and rescanning verification', () => {
    let copy = 'Brand Sentry delivers security for all enterprise teams.';
    const initialResult = runContentReview(copy, INITIAL_DEMO_RULES);
    assert.equal(initialResult.findings.length, 1);
    const finding = initialResult.findings[0];

    // Apply targeted replacement
    const { updatedContent, applied } = applyTargetedCorrection(
      copy,
      finding.matchedText,
      finding.suggestedCorrection
    );

    assert.ok(applied);
    assert.equal(updatedContent, 'BrandSentry™ delivers security for all enterprise teams.');

    // Rescan verified copy
    const rescannedResult = runContentReview(updatedContent, INITIAL_DEMO_RULES);
    assert.equal(rescannedResult.findings.length, 0);
    assert.equal(rescannedResult.complianceScore, 100);
    assert.equal(rescannedResult.status, 'COMPLIANT');
  });

  it('6. Does not evaluate disabled rules', () => {
    const disabledRules = INITIAL_DEMO_RULES.map(r => ({ ...r, enabled: false }));
    const text = 'Brand Sentry guarantees 100% guaranteed results and competitors are clueless.';

    const result = runContentReview(text, disabledRules);
    assert.equal(result.findings.length, 0);
    assert.equal(result.complianceScore, 100);
    assert.equal(result.activeRulesCount, 0);
  });

  it('7. Handles user-created custom brand rules dynamically', () => {
    const customRule = {
      id: 'RULE-CUSTOM-999',
      name: 'Forbidden Cheap Word',
      category: 'PROHIBITED_PHRASE',
      description: 'Never call our premium product cheap',
      severity: 'WARNING',
      matchPhrase: 'cheap software, bargain solution',
      suggestedCorrection: 'cost-effective enterprise tier',
      enabled: true,
      isExample: false,
      createdAt: '2026-10-24T12:00:00Z',
      updatedAt: '2026-10-24T12:00:00Z',
    };

    const rules = [...INITIAL_DEMO_RULES, customRule];
    const text = 'Try our cheap software today for all your compliance needs.';
    const result = runContentReview(text, rules);

    const match = result.findings.find(f => f.ruleId === 'RULE-CUSTOM-999');
    assert.ok(match);
    assert.equal(match.matchedText, 'cheap software');
    assert.equal(match.suggestedCorrection, 'cost-effective enterprise tier');
  });

  it('8. Derives live real dashboard metrics accurately from stored reviews', () => {
    const mockReviews = [
      {
        id: 'REV-1',
        title: 'Review 1',
        content: 'Clean text',
        channel: 'LINKEDIN',
        status: 'COMPLIANT',
        complianceScore: 100,
        submittedAt: '2026-10-24T10:00:00Z',
        findings: [],
        approvalStatus: 'APPROVED',
      },
      {
        id: 'REV-2',
        title: 'Review 2',
        content: 'Flagged text',
        channel: 'BLOG',
        status: 'FLAGGED',
        complianceScore: 70,
        submittedAt: '2026-10-24T11:00:00Z',
        findings: [{ id: 'F1', severity: 'WARNING' }, { id: 'F2', severity: 'WARNING' }],
        approvalStatus: 'PENDING',
      },
    ];

    const metrics = calculateRealMetrics(mockReviews);
    assert.equal(metrics.totalReviews, 2);
    assert.equal(metrics.detectedIssues, 2);
    assert.equal(metrics.pendingApprovals, 1);
    assert.equal(metrics.complianceRate, 85); // (100 + 70) / 2 = 85
  });
});
