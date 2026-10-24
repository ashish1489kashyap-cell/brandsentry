import { useSyncExternalStore } from 'react';
import type { ApprovalStatus, BrandRule, PlatformSettings, StoredReview } from '@/types';
import { INITIAL_DEMO_RULES } from '@/lib/engine/rules';

const STORAGE_KEYS = {
  RULES: 'brandsentry_rules_v2',
  REVIEWS: 'brandsentry_reviews_v2',
  SETTINGS: 'brandsentry_settings_v2',
} as const;

export const DEFAULT_SETTINGS: PlatformSettings = {
  orgName: 'Acme Global Brands',
  minComplianceScore: 85,
  strictMode: true,
  autoBlockCritical: true,
  reviewerIdentity: 'Demo Reviewer (Brand Lead)',
  emailAlerts: true,
  slackWebhook: '',
};

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

let cachedRules: BrandRule[] | null = null;
let cachedReviews: StoredReview[] | null = null;
let cachedSettings: PlatformSettings | null = null;

function notifyStorageChange(key: string) {
  cachedRules = null;
  cachedReviews = null;
  cachedSettings = null;

  if (!isClient()) return;
  try {
    window.dispatchEvent(new CustomEvent('brandsentry:storage-updated', { detail: { key } }));
  } catch {
    // Ignore in non-browser environments
  }
}

export function subscribeStorage(callback: () => void): () => void {
  if (!isClient()) return () => {};
  const handler = () => {
    cachedRules = null;
    cachedReviews = null;
    cachedSettings = null;
    callback();
  };
  window.addEventListener('brandsentry:storage-updated', handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener('brandsentry:storage-updated', handler);
    window.removeEventListener('storage', handler);
  };
}

export function useBrandRules(): BrandRule[] {
  return useSyncExternalStore(
    subscribeStorage,
    () => {
      if (!cachedRules) cachedRules = getStoredRules();
      return cachedRules;
    },
    () => INITIAL_DEMO_RULES
  );
}

export function useStoredReviews(): StoredReview[] {
  return useSyncExternalStore(
    subscribeStorage,
    () => {
      if (!cachedReviews) cachedReviews = getStoredReviews();
      return cachedReviews;
    },
    () => []
  );
}

export function usePlatformSettings(): PlatformSettings {
  return useSyncExternalStore(
    subscribeStorage,
    () => {
      if (!cachedSettings) cachedSettings = getStoredSettings();
      return cachedSettings;
    },
    () => DEFAULT_SETTINGS
  );
}

// -------------------------------------------------------------
// Rules Operations (Brand Vault CRUD)
// -------------------------------------------------------------

export function getStoredRules(): BrandRule[] {
  if (!isClient()) return INITIAL_DEMO_RULES;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RULES);
    if (!raw) {
      // Seed with initial demo brand profile rules
      localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(INITIAL_DEMO_RULES));
      return INITIAL_DEMO_RULES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_DEMO_RULES;
  } catch {
    return INITIAL_DEMO_RULES;
  }
}

export function saveRule(rule: BrandRule): BrandRule[] {
  if (!isClient()) return [rule];

  const current = getStoredRules();
  const existingIndex = current.findIndex(r => r.id === rule.id);

  let updated: BrandRule[];
  if (existingIndex >= 0) {
    updated = current.map((r, i) => (i === existingIndex ? { ...rule, updatedAt: new Date().toISOString() } : r));
  } else {
    updated = [
      {
        ...rule,
        createdAt: rule.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...current,
    ];
  }

  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(updated));
  notifyStorageChange(STORAGE_KEYS.RULES);
  return updated;
}

export function deleteRule(id: string): BrandRule[] {
  if (!isClient()) return [];

  const current = getStoredRules();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(updated));
  notifyStorageChange(STORAGE_KEYS.RULES);
  return updated;
}

export function toggleRuleEnabled(id: string): BrandRule[] {
  if (!isClient()) return [];

  const current = getStoredRules();
  const updated = current.map(r => (r.id === id ? { ...r, enabled: !r.enabled, updatedAt: new Date().toISOString() } : r));
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(updated));
  notifyStorageChange(STORAGE_KEYS.RULES);
  return updated;
}

export function resetRulesToDefault(): BrandRule[] {
  if (!isClient()) return INITIAL_DEMO_RULES;

  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(INITIAL_DEMO_RULES));
  notifyStorageChange(STORAGE_KEYS.RULES);
  return INITIAL_DEMO_RULES;
}

// -------------------------------------------------------------
// Review Operations (Content Review & Review History Persistence)
// -------------------------------------------------------------

export function getStoredReviews(): StoredReview[] {
  if (!isClient()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVIEWS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getReviewById(id: string): StoredReview | undefined {
  const reviews = getStoredReviews();
  return reviews.find(r => r.id === id);
}

export function saveReview(review: StoredReview): StoredReview[] {
  if (!isClient()) return [review];

  const current = getStoredReviews();
  const existingIndex = current.findIndex(r => r.id === review.id);

  let updated: StoredReview[];
  if (existingIndex >= 0) {
    updated = current.map((r, i) => (i === existingIndex ? { ...review, updatedAt: new Date().toISOString() } : r));
  } else {
    updated = [review, ...current];
  }

  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
  notifyStorageChange(STORAGE_KEYS.REVIEWS);
  return updated;
}

export function updateReviewApproval(
  id: string,
  status: ApprovalStatus,
  notes?: string,
  reviewer: string = 'Demo Reviewer (Brand Lead)'
): StoredReview[] {
  if (!isClient()) return [];

  const current = getStoredReviews();
  const timestamp = new Date().toISOString();

  const updated = current.map(r => {
    if (r.id !== id) return r;
    return {
      ...r,
      approvalStatus: status,
      updatedAt: timestamp,
      approvalDecision: {
        status,
        timestamp,
        reviewer,
        notes,
      },
    };
  });

  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
  notifyStorageChange(STORAGE_KEYS.REVIEWS);
  return updated;
}

export function deleteReview(id: string): StoredReview[] {
  if (!isClient()) return [];

  const current = getStoredReviews();
  const updated = current.filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(updated));
  notifyStorageChange(STORAGE_KEYS.REVIEWS);
  return updated;
}

export function clearAllStoredReviews(): void {
  if (!isClient()) return;
  localStorage.removeItem(STORAGE_KEYS.REVIEWS);
  notifyStorageChange(STORAGE_KEYS.REVIEWS);
}

// -------------------------------------------------------------
// Settings Operations
// -------------------------------------------------------------

export function getStoredSettings(): PlatformSettings {
  if (!isClient()) return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: PlatformSettings): PlatformSettings {
  if (!isClient()) return settings;

  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  notifyStorageChange(STORAGE_KEYS.SETTINGS);
  return settings;
}

export { calculateRealMetrics } from '@/lib/engine/reviewer';
