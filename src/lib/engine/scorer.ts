import { EngineScanResult, RuleEvaluation, ScanRequest } from './types';
import { INITIAL_DEMO_RULES } from './rules';
import { ReviewIssue } from '@/types';
import { runContentReview } from './reviewer';

export {
  calculateComplianceScore,
  deriveReviewStatus,
  runContentReview,
  applyTargetedCorrection,
} from './reviewer';

/**
 * Backward compatibility wrapper for Phase 1 evaluateContentRules.
 */
export function evaluateContentRules(request: ScanRequest): EngineScanResult {
  const result = runContentReview(request.text, INITIAL_DEMO_RULES, request.channel);

  const ruleEvaluations: RuleEvaluation[] = INITIAL_DEMO_RULES.map(rule => {
    const matchingFindings = result.findings.filter(f => f.ruleId === rule.id);
    return {
      ruleId: rule.id,
      ruleTitle: rule.name,
      passed: matchingFindings.length === 0,
      issues: matchingFindings as ReviewIssue[],
    };
  });

  return {
    scanId: result.scanId,
    channel: result.channel,
    status: result.status,
    complianceScore: result.complianceScore,
    evaluatedAt: result.evaluatedAt,
    issues: result.findings as ReviewIssue[],
    evaluations: ruleEvaluations,
    summary: {
      criticalCount: result.severityBreakdown.critical,
      warningCount: result.severityBreakdown.warning,
      infoCount: result.severityBreakdown.info,
    },
  };
}
