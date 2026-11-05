import React, { useState } from 'react';
import { Project, WhatIfScenarioResult } from '../types';
import { analyzeWhatIfScenario } from '../utils/api';
import {
  X,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  GitFork,
  Check,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react';

interface WhatIfModalProps {
  isOpen: boolean;
  project: Project;
  onClose: () => void;
  onApplyScenario: (scenario: WhatIfScenarioResult) => void;
  onForkProject: (scenario: WhatIfScenarioResult) => void;
}

const PRESET_SCENARIOS = [
  'What if I had 20 hours per week available instead of my current hours?',
  'What if my validation budget was doubled to run paid traffic tests?',
  'What if I pivoted to targeting enterprise multi-location chains instead of boutique owners?',
  'What if I did zero custom coding and offered a 100% concierge manual service first?',
];

export const WhatIfModal: React.FC<WhatIfModalProps> = ({
  isOpen,
  project,
  onClose,
  onApplyScenario,
  onForkProject,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scenarioResult, setScenarioResult] = useState<WhatIfScenarioResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRunScenario = async (promptToRun: string) => {
    if (!promptToRun.trim()) return;
    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const result = await analyzeWhatIfScenario(project, promptToRun.trim());
      setScenarioResult(result);
    } catch (err: any) {
      console.error('What-If analysis failed:', err);
      setErrorMessage(err.message || 'Failed to simulate scenario. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = () => {
    if (!scenarioResult) return;
    onApplyScenario(scenarioResult);
    onClose();
  };

  const handleFork = () => {
    if (!scenarioResult) return;
    onForkProject(scenarioResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-semibold text-base text-zinc-100">
                  AI "What If" Scenario Simulator
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-950 text-rose-400 border border-rose-900 rounded-xs">
                  Counterfactual Analysis
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Stress-test hypothetical parameter shifts against the Redline validation razor
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input & Quick Chips */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-950/40 space-y-3">
          <label className="block text-xs font-semibold text-zinc-200">
            Enter a hypothetical change or parameter shift:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleRunScenario(promptInput);
                }
              }}
              placeholder="e.g. What if I had 25 hours per week? / What if my budget was doubled?"
              className="flex-1 px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-rose-500"
            />
            <button
              onClick={() => handleRunScenario(promptInput)}
              disabled={isAnalyzing || !promptInput.trim()}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Run Scenario</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
            <span className="text-zinc-500">Quick Scenarios:</span>
            {PRESET_SCENARIOS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPromptInput(preset);
                  handleRunScenario(preset);
                }}
                className="px-2 py-0.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 rounded-xs transition-colors cursor-pointer"
              >
                {preset.slice(0, 38)}...
              </button>
            ))}
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-900 text-xs text-rose-300 rounded-md">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Results Area */}
        <div className="p-6 max-h-[55vh] overflow-y-auto space-y-6">
          {!scenarioResult && !isAnalyzing && (
            <div className="py-12 text-center text-xs text-zinc-500">
              <Zap className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              <p className="text-zinc-300 font-medium">Test hypothetical founder trade-offs</p>
              <p className="text-zinc-500 mt-1 max-w-md mx-auto">
                Type a scenario above to analyze how extra hours, doubled budget, or a customer pivot would change your strategy and 7-day schedule.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-rose-500 mx-auto" />
              <p className="text-xs font-mono text-zinc-300">
                Evaluating counterfactual assumptions with Gemini 3.8 Flash...
              </p>
              <p className="text-[11px] text-zinc-500">
                Checking whether this accelerates customer truth or adds over-engineering risk.
              </p>
            </div>
          )}

          {scenarioResult && !isAnalyzing && (
            <div className="space-y-6">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-lg border ${
                  scenarioResult.verdictOnScenario === 'WORTHWHILE_SHIFT'
                    ? 'bg-emerald-950/30 border-emerald-800/80'
                    : scenarioResult.verdictOnScenario === 'DISTRACTING_NOISE'
                    ? 'bg-rose-950/30 border-rose-800/80'
                    : 'bg-amber-950/30 border-amber-800/80'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
                    Scenario Verdict
                  </span>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-xs uppercase ${
                      scenarioResult.verdictOnScenario === 'WORTHWHILE_SHIFT'
                        ? 'bg-emerald-900 text-emerald-200'
                        : scenarioResult.verdictOnScenario === 'DISTRACTING_NOISE'
                        ? 'bg-rose-900 text-rose-200'
                        : 'bg-amber-900 text-amber-200'
                    }`}
                  >
                    {scenarioResult.verdictOnScenario.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                  {scenarioResult.verdictRationale}
                </p>
              </div>

              {/* Revised Strategy Summary */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2">
                <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
                  Revised Strategic Direction
                </h4>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {scenarioResult.revisedStrategySummary}
                </p>
              </div>

              {/* Potential Impacts: Advantages vs New Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Advantages */}
                <div className="p-4 bg-zinc-900/40 border border-emerald-900/40 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Potential Advantages</span>
                  </div>
                  <ul className="space-y-1.5 text-zinc-300">
                    {scenarioResult.potentialImpacts.advantages.map((adv, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-mono">·</span>
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* New Risks */}
                <div className="p-4 bg-zinc-900/40 border border-rose-900/40 rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-rose-400 font-semibold uppercase tracking-wide">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>New Failure Modes & Risks</span>
                  </div>
                  <ul className="space-y-1.5 text-zinc-300">
                    {scenarioResult.potentialImpacts.newRisks.map((risk, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-mono">⚠️</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Leverage Assessment Callout */}
              <div className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-md text-xs text-zinc-300">
                <strong className="text-rose-400">Leverage Assessment: </strong>
                <span>{scenarioResult.potentialImpacts.leverageAssessment}</span>
              </div>

              {/* Adjusted 7-Day Execution Plan */}
              {scenarioResult.adjustedExecutionPlan.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wide">
                      Adjusted 7-Day Execution Plan
                    </h4>
                    <span className="text-[11px] font-mono text-zinc-400">
                      7 Days Rebalanced
                    </span>
                  </div>

                  <div className="space-y-2">
                    {scenarioResult.adjustedExecutionPlan.map((day) => (
                      <div
                        key={day.dayNumber}
                        className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-md flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-mono font-bold text-rose-400">
                              Day 0{day.dayNumber}
                            </span>
                            <span className="font-semibold text-zinc-200 truncate">
                              {day.title}
                            </span>
                            <span className="font-mono text-zinc-400 tabular-nums">
                              ({day.estimatedHours}h)
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-300 leading-normal">
                            Deliverable: <strong className="text-zinc-100">{day.revisedDeliverable}</strong>
                          </p>
                          <p className="text-[10px] text-rose-400 mt-1 font-mono">
                            Shift: {day.shiftFromOriginal}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200"
          >
            Close
          </button>

          {scenarioResult && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleFork}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-md transition-colors cursor-pointer"
              >
                <GitFork className="w-3.5 h-3.5 text-zinc-400" />
                <span>Save as New Forked Project</span>
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors shadow-xs shadow-rose-950 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Scenario to Current Sprint</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
