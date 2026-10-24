import type {
  BrandRule,
  DashboardMetrics,
  PublishingChannel,
  ReviewFinding,
  ReviewStatus,
  StoredReview,
} from '@/types';

export interface ReviewEngineResult {
  scanId: string;
  channel: PublishingChannel;
  evaluatedAt: string;
  contentSnapshot: string;
  wordCount: number;
  characterCount: number;
  rulesEvaluatedCount: number;
  activeRulesCount: number;
  findings: ReviewFinding[];
  complianceScore: number;
  status: ReviewStatus;
  severityBreakdown: {
    critical: number;
    warning: number;
    info: number;
  };
  scoringExplanation: {
    formula: string;
    baseScore: number;
    deductions: number;
    finalScore: number;
  };
}

/**
 * Extracts the full sentence or immediate boundary around a matched index.
 */
export function extractEvidenceSentence(text: string, startIndex: number, endIndex: number): string {
  if (!text) return '';

  // Find start of sentence (look backwards for punctuation or newline)
  let sentenceStart = 0;
  for (let i = startIndex - 1; i >= 0; i--) {
    const char = text[i];
    if (char === '.' || char === '!' || char === '?' || char === '\n') {
      sentenceStart = i + 1;
      break;
    }
  }

  // Find end of sentence (look forward for punctuation or newline)
  let sentenceEnd = text.length;
  for (let i = endIndex; i < text.length; i++) {
    const char = text[i];
    if (char === '.' || char === '!' || char === '?' || char === '\n') {
      sentenceEnd = i + 1;
      break;
    }
  }

  const evidence = text.substring(sentenceStart, sentenceEnd).trim();
  // Fallback to substring if evidence is somehow empty
  return evidence || text.substring(Math.max(0, startIndex - 20), Math.min(text.length, endIndex + 20));
}

/**
 * Deterministic scoring calculation.
 * Base score: 100.
 * Deductions:
 *   - CRITICAL: -25 points each (Blocks publication)
 *   - WARNING:  -10 points each (Requires review)
 *   - INFO:     -3 points each  (Advisory)
 * Zero violations always yields 100%.
 */
export function calculateComplianceScore(findings: ReviewFinding[]): {
  score: number;
  deductions: number;
  breakdown: { critical: number; warning: number; info: number };
} {
  let critical = 0;
  let warning = 0;
  let info = 0;

  for (const finding of findings) {
    if (finding.severity === 'CRITICAL') critical++;
    else if (finding.severity === 'WARNING') warning++;
    else if (finding.severity === 'INFO') info++;
  }

  const deductions = critical * 25 + warning * 10 + info * 3;
  const score = Math.max(0, 100 - deductions);

  return {
    score,
    deductions,
    breakdown: { critical, warning, info },
  };
}

/**
 * Derives the publication status from compliance score and severity.
 */
export function deriveReviewStatus(score: number, findings: ReviewFinding[]): ReviewStatus {
  const hasCritical = findings.some(f => f.severity === 'CRITICAL');
  if (hasCritical || score < 60) return 'FLAGGED';
  if (findings.length > 0 || score < 85) return 'NEEDS_REVISION';
  return 'COMPLIANT';
}

/**
 * Executes a deterministic, rule-based text review against active brand rules.
 * Does not use external AI APIs or simulate imaginary findings.
 */
export function runContentReview(
  content: string,
  rules: BrandRule[],
  channel: PublishingChannel = 'LINKEDIN'
): ReviewEngineResult {
  const trimmed = content || '';
  const findings: ReviewFinding[] = [];
  const activeRules = rules.filter(r => r.enabled);
  const lowerContent = trimmed.toLowerCase();

  // If text is completely empty, return zero violations baseline
  if (!trimmed.trim()) {
    return {
      scanId: `SCAN-${Date.now().toString(36).toUpperCase()}`,
      channel,
      evaluatedAt: new Date().toISOString(),
      contentSnapshot: trimmed,
      wordCount: 0,
      characterCount: 0,
      rulesEvaluatedCount: rules.length,
      activeRulesCount: activeRules.length,
      findings: [],
      complianceScore: 100,
      status: 'COMPLIANT',
      severityBreakdown: { critical: 0, warning: 0, info: 0 },
      scoringExplanation: {
        formula: '100 - (Critical × 25 + Warning × 10 + Info × 3)',
        baseScore: 100,
        deductions: 0,
        finalScore: 100,
      },
    };
  }

  // Set to prevent duplicate finding overlaps for the same rule
  const matchedSpans: { start: number; end: number; ruleId: string }[] = [];

  for (const rule of activeRules) {
    if (!rule.matchPhrase || !rule.matchPhrase.trim()) continue;

    // Parse comma-separated match phrases or terms
    const phrases = rule.matchPhrase
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);

    for (const phrase of phrases) {
      const lowerPhrase = phrase.toLowerCase();
      let searchIndex = 0;

      while (searchIndex < lowerContent.length) {
        const foundIndex = lowerContent.indexOf(lowerPhrase, searchIndex);
        if (foundIndex === -1) break;

        const endIndex = foundIndex + phrase.length;

        // Verify if this exact span was already recorded for this rule
        const alreadyMatched = matchedSpans.some(
          m => m.ruleId === rule.id && Math.max(m.start, foundIndex) < Math.min(m.end, endIndex)
        );

        if (!alreadyMatched) {
          matchedSpans.push({ start: foundIndex, end: endIndex, ruleId: rule.id });

          // Extract exact original text from content
          const exactText = trimmed.substring(foundIndex, endIndex);
          const evidence = extractEvidenceSentence(trimmed, foundIndex, endIndex);

          let explanation = rule.description;
          if (rule.category === 'REQUIRED_TERMINOLOGY' && rule.targetTerm) {
            explanation = `Non-standard brand terminology: "${exactText}". Official brand standard requires "${rule.targetTerm}".`;
          } else if (rule.category === 'PROHIBITED_PHRASE') {
            explanation = `Configured prohibited phrase detected: "${exactText}". Rule policy: ${rule.description}`;
          } else if (rule.category === 'APPROVED_CLAIM') {
            explanation = `Unverified absolute or performance claim detected: "${exactText}". Requires legal qualification or approved benchmark reference.`;
          } else if (rule.category === 'TONE_VOICE') {
            explanation = `Brand tone deviation detected: "${exactText}". Does not meet brand voice guidelines.`;
          }

          findings.push({
            id: `FINDING-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
            ruleId: rule.id,
            ruleName: rule.name,
            category: rule.category,
            severity: rule.severity,
            matchedText: exactText,
            evidence,
            explanation,
            suggestedCorrection: rule.suggestedCorrection || (rule.category === 'REQUIRED_TERMINOLOGY' ? rule.targetTerm : undefined),
            startIndex: foundIndex,
            endIndex,
          });
        }

        searchIndex = foundIndex + 1;
      }
    }
  }

  const { score, deductions, breakdown } = calculateComplianceScore(findings);
  const status = deriveReviewStatus(score, findings);

  const words = trimmed.trim() ? trimmed.trim().split(/\s+/).length : 0;

  return {
    scanId: `SCAN-${Date.now().toString(36).toUpperCase()}`,
    channel,
    evaluatedAt: new Date().toISOString(),
    contentSnapshot: trimmed,
    wordCount: words,
    characterCount: trimmed.length,
    rulesEvaluatedCount: rules.length,
    activeRulesCount: activeRules.length,
    findings,
    complianceScore: score,
    status,
    severityBreakdown: breakdown,
    scoringExplanation: {
      formula: '100 - (Critical × 25 + Warning × 10 + Info × 3)',
      baseScore: 100,
      deductions,
      finalScore: score,
    },
  };
}

/**
 * Performs targeted phrase replacement for a specific finding.
 * Preserves the rest of the content while replacing the offending phrase.
 */
export function applyTargetedCorrection(
  content: string,
  matchedText: string,
  suggestedCorrection?: string
): { updatedContent: string; applied: boolean } {
  if (!content || !matchedText || !suggestedCorrection) {
    return { updatedContent: content, applied: false };
  }

  // Case-insensitive targeted first occurrence replacement
  const lowerContent = content.toLowerCase();
  const lowerMatch = matchedText.toLowerCase();
  const index = lowerContent.indexOf(lowerMatch);

  if (index === -1) {
    return { updatedContent: content, applied: false };
  }

  const before = content.substring(0, index);
  const after = content.substring(index + matchedText.length);
  const updatedContent = `${before}${suggestedCorrection}${after}`;

  return { updatedContent, applied: true };
}

/**
 * Calculates live dashboard metrics from stored review records.
 */
export function calculateRealMetrics(reviews: StoredReview[]): DashboardMetrics {
  if (!reviews || reviews.length === 0) {
    return {
      totalReviews: 0,
      detectedIssues: 0,
      pendingApprovals: 0,
      complianceRate: 0,
      trendReviews: 0,
      trendIssues: 0,
      trendApprovals: 0,
      trendCompliance: 0,
    };
  }

  const totalReviews = reviews.length;
  const detectedIssues = reviews.reduce((sum, r) => sum + (r.findings ? r.findings.length : 0), 0);
  const pendingApprovals = reviews.filter(r => r.approvalStatus === 'PENDING').length;
  const totalScore = reviews.reduce((sum, r) => sum + (r.complianceScore || 0), 0);
  const complianceRate = Math.round((totalScore / totalReviews) * 10) / 10;

  return {
    totalReviews,
    detectedIssues,
    pendingApprovals,
    complianceRate,
    trendReviews: undefined,
    trendIssues: undefined,
    trendApprovals: undefined,
    trendCompliance: undefined,
  };
}
