import { BrandGuideline, PublishingChannel, ReviewIssue, ReviewStatus, Severity } from '@/types';

export interface ScanRequest {
  id: string;
  title: string;
  text: string;
  channel: PublishingChannel;
  strictMode?: boolean;
  activeGuidelineIds?: string[];
}

export interface RuleEvaluation {
  ruleId: string;
  ruleTitle: string;
  passed: boolean;
  issues: ReviewIssue[];
}

export interface EngineScanResult {
  scanId: string;
  channel: PublishingChannel;
  status: ReviewStatus;
  complianceScore: number;
  evaluatedAt: string;
  issues: ReviewIssue[];
  evaluations: RuleEvaluation[];
  summary: {
    criticalCount: number;
    warningCount: number;
    infoCount: number;
  };
}

export interface EngineRuleDefinition {
  id: string;
  category: BrandGuideline['category'];
  title: string;
  description: string;
  severity: Severity;
  patternKeywords?: string[];
  suggestedReplacement?: string;
  check: (text: string) => { passed: boolean; matchedText?: string; suggestion?: string; reason?: string };
}
