import React, { useState } from 'react';
import { AutomationWorkflow, AutomationLog } from '../../types';
import { Zap, Play, CheckCircle2, AlertTriangle, Clock, Plus, RefreshCw, Filter, ShieldAlert, FileText, Sparkles } from 'lucide-react';
import { evaluateAutomation } from '../../services/geminiService';

interface AutomationCenterProps {
  workflows: AutomationWorkflow[];
  onToggleWorkflow: (id: string) => void;
  onExecuteWorkflow: (id: string) => void;
  onAddWorkflow: (workflow: AutomationWorkflow) => void;
}

export const AutomationCenter: React.FC<AutomationCenterProps> = ({
  workflows,
  onToggleWorkflow,
  onExecuteWorkflow,
  onAddWorkflow,
}) => {
  const [activeTab, setActiveTab] = useState<'workflows' | 'logs' | 'templates'>('workflows');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [testRunningId, setTestRunningId] = useState<string | null>(null);

  // New Workflow Form State
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newTriggerType, setNewTriggerType] = useState<'keyword' | 'on_urgent' | 'scheduled'>('keyword');
  const [newKeywordInput, setNewKeywordInput] = useState('review, urgent, approved');
  const [newActionType, setNewActionType] = useState<'post_reply' | 'escalate_alert' | 'ai_summary'>('post_reply');

  // Aggregated logs from all workflows
  const allLogs: AutomationLog[] = workflows.flatMap((w) => w.logs).sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  const handleTestRun = async (workflow: AutomationWorkflow) => {
    setTestRunningId(workflow.id);
    await onExecuteWorkflow(workflow.id);
    setTimeout(() => {
      setTestRunningId(null);
    }, 1200);
  };

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const newWf: AutomationWorkflow = {
      id: `wf-${Date.now()}`,
      name: newRuleName,
      description: newRuleDesc || 'Custom automation rule created by Alex Mercer.',
      icon: newActionType === 'escalate_alert' ? '⚡' : newActionType === 'ai_summary' ? '📋' : '🤖',
      isEnabled: true,
      trigger: {
        type: newTriggerType,
        label: newTriggerType === 'keyword' ? `When message contains keywords` : newTriggerType === 'on_urgent' ? 'When urgent status is detected' : 'Daily 9:00 AM Cron',
        description: `Monitors active channels for trigger condition`,
        config: {
          keywords: newKeywordInput.split(',').map((k) => k.trim()),
        },
      },
      action: {
        type: newActionType,
        label: newActionType === 'escalate_alert' ? 'Escalate Incident to SRE' : newActionType === 'ai_summary' ? 'Post AI Channel Digest' : 'Send Automated Reply',
        description: 'Auto-executed by Teams Bot Engine',
        config: {},
      },
      stats: {
        totalRuns: 1,
        lastTriggered: 'Just now',
      },
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: 'Just now',
          triggerEvent: `Rule "${newRuleName}" initialized & verified`,
          actionExecuted: 'Registered to Microsoft Teams bot event hub',
          status: 'success',
          channelName: 'general',
          details: 'Ready to listen to channel message streams.',
        },
      ],
    };

    onAddWorkflow(newWf);
    setShowCreateModal(false);
    setNewRuleName('');
    setNewRuleDesc('');
  };

  return (
    <div className="flex-1 h-full bg-[#f3f4f6] dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Top Banner / Hero */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-5 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Workflows &amp; Automation Center</span>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    Power Automate
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Event-driven bots, AI sentiment escalation, and autonomous channel task workflows.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Workflow</span>
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex items-center gap-6 mt-6 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'workflows'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Active Rules ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'logs'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Execution Audit Logs ({allLogs.length})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'workflows' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workflows.map((wf) => (
                <div
                  key={wf.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-2 rounded-lg bg-slate-100 dark:bg-slate-800">{wf.icon}</span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{wf.name}</h3>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {wf.stats.totalRuns} executions • Last run {wf.stats.lastTriggered || 'Never'}
                          </span>
                        </div>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <button
                        onClick={() => onToggleWorkflow(wf.id)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          wf.isEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        title={wf.isEnabled ? 'Rule is active' : 'Rule is paused'}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            wf.isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {wf.description}
                    </p>

                    {/* Trigger & Action Flow Visualization */}
                    <div className="mt-4 bg-slate-50 dark:bg-slate-950/60 rounded-lg p-3 border border-slate-200 dark:border-slate-800 text-[11px] space-y-2">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">WHEN:</span>
                        <span className="truncate">{wf.trigger.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">THEN:</span>
                        <span className="truncate">{wf.action.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{wf.isEnabled ? 'Ready & Listening' : 'Paused'}</span>
                    </div>

                    <button
                      onClick={() => handleTestRun(wf)}
                      disabled={testRunningId === wf.id}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      {testRunningId === wf.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Simulating...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Test Run</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Execution Audit Logs Tab */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Execution Audit Stream</h3>
                <p className="text-xs text-slate-500">Every bot evaluation, keyword trigger, and automated action is recorded.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {allLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {log.status === 'success' ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 flex items-center justify-center">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>{log.triggerEvent}</span>
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.2 rounded border border-indigo-200 dark:border-indigo-800">
                            #{log.channelName}
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300 mt-1">
                          {log.actionExecuted}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                          {log.details}
                        </div>
                      </div>
                    </div>
                    <div className="text-slate-400 text-[11px] whitespace-nowrap flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-base font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-600" />
                Build Teams Automation Flow
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkflow} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Workflow Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. VIP Customer Triage Bot"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief summary of what this automation does"
                  value={newRuleDesc}
                  onChange={(e) => setNewRuleDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Trigger Event (When this happens...)
                </label>
                <select
                  value={newTriggerType}
                  onChange={(e) => setNewTriggerType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="keyword">A message contains specific keywords</option>
                  <option value="on_urgent">AI detects urgent incident or outage sentiment</option>
                  <option value="scheduled">Scheduled daily recurring standup</option>
                </select>
              </div>

              {newTriggerType === 'keyword' && (
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Target Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newKeywordInput}
                    onChange={(e) => setNewKeywordInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Automated Action (Do this...)
                </label>
                <select
                  value={newActionType}
                  onChange={(e) => setNewActionType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="post_reply">Post instant automated Bot reply in channel</option>
                  <option value="escalate_alert">Trigger high-priority incident escalation &amp; tag engineer</option>
                  <option value="ai_summary">Use Gemini 3.8 to synthesize &amp; post AI digest</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm cursor-pointer"
                >
                  Save &amp; Activate Flow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
