'use client';

import React, { useState } from 'react';
import {
  Plus,
  Search,
  Clock,
  Edit2,
  Trash2,
  RotateCcw,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { BrandRule, RuleCategory, Severity } from '@/types';
import { useToast } from '@/components/ui/Toast';
import {
  useBrandRules,
  saveRule,
  deleteRule,
  toggleRuleEnabled,
  resetRulesToDefault,
} from '@/lib/storage';

export default function BrandVaultPage() {
  const { showToast } = useToast();
  const rules = useBrandRules();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories: { id: string; label: string }[] = [
    { id: 'ALL', label: 'All Rules' },
    { id: 'PROHIBITED_PHRASE', label: 'Prohibited Phrases' },
    { id: 'REQUIRED_TERMINOLOGY', label: 'Required Terminology' },
    { id: 'APPROVED_CLAIM', label: 'Approved Claims' },
    { id: 'TONE_VOICE', label: 'Tone & Voice' },
    { id: 'OTHER', label: 'Other Policies' },
  ];

  const filteredRules = rules.filter(r => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.matchPhrase.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.targetTerm && r.targetTerm.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreateModal = () => {
    setEditingRuleId(null);
    setFormName('');
    setFormCategory('PROHIBITED_PHRASE');
    setFormSeverity('WARNING');
    setFormMatchPhrase('');
    setFormTargetTerm('');
    setFormSuggestedCorrection('');
    setFormDescription('');
    setFormEnabled(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: BrandRule) => {
    setEditingRuleId(rule.id);
    setFormName(rule.name);
    setFormCategory(rule.category);
    setFormSeverity(rule.severity);
    setFormMatchPhrase(rule.matchPhrase);
    setFormTargetTerm(rule.targetTerm || '');
    setFormSuggestedCorrection(rule.suggestedCorrection || '');
    setFormDescription(rule.description);
    setFormEnabled(rule.enabled);
    setIsModalOpen(true);
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formMatchPhrase.trim() || !formDescription.trim()) {
      showToast('Validation Error', 'Rule Name, Match Phrase, and Description are required.', 'warning');
      return;
    }

    const ruleData: BrandRule = {
      id: editingRuleId || `RULE-USER-${Date.now().toString(36).toUpperCase()}`,
      name: formName.trim(),
      category: formCategory,
      severity: formSeverity,
      matchPhrase: formMatchPhrase.trim(),
      targetTerm: formTargetTerm.trim() || undefined,
      suggestedCorrection: formSuggestedCorrection.trim() || undefined,
      description: formDescription.trim(),
      enabled: formEnabled,
      isExample: editingRuleId ? rules.find(r => r.id === editingRuleId)?.isExample : false,
      createdAt: editingRuleId
        ? rules.find(r => r.id === editingRuleId)?.createdAt || new Date().toISOString()
        : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = saveRule(ruleData);
    setRules(updated);
    setIsModalOpen(false);

    showToast(
      editingRuleId ? 'Rule Updated' : 'Rule Created',
      `"${ruleData.name}" is now stored in Brand Vault and will be enforced during content reviews.`,
      'success'
    );
  };

  const handleToggleRule = (id: string) => {
    const updated = toggleRuleEnabled(id);
    setRules(updated);
    const toggled = updated.find(r => r.id === id);
    showToast(
      'Rule Status Updated',
      `"${toggled?.name}" is now ${toggled?.enabled ? 'ACTIVE' : 'DISABLED'}.`,
      'info'
    );
  };

  const handleDeleteConfirm = () => {
    if (!ruleToDelete) return;
    const updated = deleteRule(ruleToDelete.id);
    setRules(updated);
    showToast('Rule Deleted', `"${ruleToDelete.name}" was removed from Brand Vault.`, 'info');
    setRuleToDelete(null);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all brand rules to the initial demo brand profile? User-added rules will be replaced.')) {
      const reset = resetRulesToDefault();
      setRules(reset);
      showToast('Rules Reset', 'Brand Vault restored to standard demo rules.', 'success');
    }
  };

  if (!mounted) {
    return <div className="p-8 text-center text-slate-400">Loading Brand Vault...</div>;
  }

  const activeCount = rules.filter(r => r.enabled).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white">Brand Vault</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800/60 font-medium">
              {activeCount} of {rules.length} Rules Active
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Central repository for brand voice guidelines, disallowed claims, terminology, and legal compliance rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleResetDefaults}
            title="Restore default demo brand profile"
          >
            Reset to Demo Rules
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
          >
            New Brand Rule
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search rules by name, phrase, or target..."
            className="w-full bg-[#0d1527] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white font-medium shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map(rule => (
          <Card
            key={rule.id}
            className={`flex flex-col justify-between transition-all ${
              !rule.enabled ? 'opacity-65 border-slate-800/40 bg-[#090d19]' : ''
            }`}
          >
            <div>
              {/* Header tags */}
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {rule.id}
                  </span>
                  <Badge category={rule.category} size="sm" />
                  <Badge severity={rule.severity} size="sm" />
                  {rule.isExample ? (
                    <span className="text-[10px] text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-900 font-medium">
                      Demo Profile Rule
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-900 font-medium">
                      Custom Rule
                    </span>
                  )}
                </div>

                {/* Enable / Disable toggle button */}
                <button
                  type="button"
                  onClick={() => handleToggleRule(rule.id)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold border transition-all ${
                    rule.enabled
                      ? 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80 hover:bg-emerald-900/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                  }`}
                  title={rule.enabled ? 'Click to disable rule' : 'Click to enable rule'}
                >
                  {rule.enabled ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-semibold text-white mb-1.5">{rule.name}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{rule.description}</p>

              {/* Match Phrase & Suggested Fix box */}
              <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/90 mb-4 text-xs">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Matching Phrase(s)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.matchPhrase.split(',').map((phrase, idx) => (
                      <span
                        key={idx}
                        className="font-mono text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/50 text-[11px]"
                      >
                        &ldquo;{phrase.trim()}&rdquo;
                      </span>
                    ))}
                  </div>
                </div>

                {rule.targetTerm && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Target Required Term
                    </span>
                    <span className="font-semibold text-blue-300">{rule.targetTerm}</span>
                  </div>
                )}

                {rule.suggestedCorrection && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Suggested Correction
                    </span>
                    <span className="text-emerald-400 font-medium">{rule.suggestedCorrection}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom bar with Actions & Timestamp */}
            <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {new Date(rule.updatedAt || rule.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(rule)}
                  className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                  title="Edit rule"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setRuleToDelete(rule)}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
                  title="Delete rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <div className="p-10 text-center rounded-xl border border-dashed border-slate-800 text-slate-400">
          No brand rules matched your search or category filter.
        </div>
      )}

      {/* Create / Edit Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingRuleId ? 'Edit Brand Rule' : 'Create New Brand Rule'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure deterministic brand rules for pre-publication governance enforcement.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRule} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Rule Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Prohibit Absolute Guarantees"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as RuleCategory)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="PROHIBITED_PHRASE">Prohibited Phrase</option>
                    <option value="REQUIRED_TERMINOLOGY">Required Terminology</option>
                    <option value="APPROVED_CLAIM">Approved Claim</option>
                    <option value="TONE_VOICE">Tone & Voice</option>
                    <option value="OTHER">Other Policy</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Severity *
                  </label>
                  <select
                    value={formSeverity}
                    onChange={e => setFormSeverity(e.target.value as Severity)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="CRITICAL">Critical (-25 pts, Blocks Approval)</option>
                    <option value="WARNING">Warning (-10 pts, Review Needed)</option>
                    <option value="INFO">Informational (-3 pts, Advisory)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Matching Phrase or Pattern * (comma-separated for multiple)
                </label>
                <input
                  type="text"
                  required
                  value={formMatchPhrase}
                  onChange={e => setFormMatchPhrase(e.target.value)}
                  placeholder="e.g. guaranteed results, 100% risk-free, zero downtime"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  The engine will search content case-insensitively for these exact phrases.
                </span>
              </div>

              {formCategory === 'REQUIRED_TERMINOLOGY' && (
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Target Required Term
                  </label>
                  <input
                    type="text"
                    value={formTargetTerm}
                    onChange={e => setFormTargetTerm(e.target.value)}
                    placeholder="e.g. BrandSentry™"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Suggested Correction (Optional)
                </label>
                <input
                  type="text"
                  value={formSuggestedCorrection}
                  onChange={e => setFormSuggestedCorrection(e.target.value)}
                  placeholder="e.g. engineered for high reliability"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Used by the review editor for targeted 1-click replacements.
                </span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Description / Policy Explanation *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Explain why this rule exists and why content will be flagged..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={formEnabled}
                    onChange={e => setFormEnabled(e.target.checked)}
                    className="rounded border-slate-700 text-blue-600 focus:ring-0"
                  />
                  <span>Enable this rule immediately for all content scans</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit">
                  {editingRuleId ? 'Save Changes' : 'Create Rule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {ruleToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-2">Delete Brand Rule?</h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Are you sure you want to delete <strong className="text-white">&ldquo;{ruleToDelete.name}&rdquo;</strong>?
              This rule will no longer be enforced on future content scans.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setRuleToDelete(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                Delete Rule
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
