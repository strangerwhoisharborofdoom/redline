import React from 'react';
import { StrategyAnalysis, ProjectInput } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Crosshair,
  Ban,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface StrategyViewProps {
  strategy: StrategyAnalysis | null;
  input: ProjectInput;
  scenarios?: import('../types').WhatIfScenarioResult[];
  onGoToSprint: () => void;
  onRegenerate: () => void;
  onOpenWhatIf: () => void;
  isGenerating: boolean;
}

export const StrategyView: React.FC<StrategyViewProps> = ({
  strategy,
  input,
  scenarios,
  onGoToSprint,
  onRegenerate,
  onOpenWhatIf,
  isGenerating,
}) => {
  if (!strategy) {
    return (
      <div className="p-8 text-center max-w-xl mx-auto py-20">
        <div className="w-12 h-12 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 text-rose-500">
          <Crosshair className="w-6 h-6" />
        </div>
        <h3 className="font-display font-semibold text-lg text-zinc-100 mb-2">
          No Redline Strategy Synthesized Yet
        </h3>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Click below to analyze your raw input, deconstruct assumptions, and generate your 7-day validation sprint.
        </p>
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Find my Redline</span>
        </button>
      </div>
    );
  }

  const {
    customerAndProblem,
    riskiestAssumption,
    evidenceVsAssumption,
    threeApproaches,
    recommendedApproach,
    narrowMvpScope,
    doNotBuildYet,
    validationExperiment,
    successThreshold,
    stopOrPivotCondition,
  } = strategy;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Fallback Notice if Offline or Demo */}
      {strategy.isDemoOrFallback && (
        <div className="p-3 bg-zinc-900/90 border border-zinc-700/80 rounded-lg flex items-center justify-between text-xs text-zinc-300">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Verified Demo/Offline Mode:</strong> Synthesized with deterministic lean heuristic rules.
            </span>
          </div>
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="text-xs text-rose-400 hover:text-rose-300 underline font-medium cursor-pointer"
          >
            Retry with AI
          </button>
        </div>
      )}

      {/* 1. Customer and Specific Problem */}
      <section className="bg-[#121215] border border-zinc-800 rounded-lg p-5 md:p-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 mb-1">
          01. Problem Anatomy & Specific Customer
        </div>
        <h2 className="text-lg md:text-xl font-display font-bold text-zinc-100 mb-4">
          Who Hursts, How Much, and Why Now
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div>
            <h4 className="text-xs font-semibold text-zinc-300 mb-1">Target Customer</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {customerAndProblem.targetCustomer}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-300 mb-1">Specific Bleeding Problem</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {customerAndProblem.specificProblem}
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-zinc-300 mb-1">Urgency & Why Now</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {customerAndProblem.whyNowAndUrgency}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Riskiest Assumption (Dominant Failure Point) */}
      <section className="bg-gradient-to-r from-rose-950/30 to-zinc-900/50 border border-rose-900/40 rounded-lg p-5 md:p-6 relative overflow-hidden">
        <div className="flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-md bg-rose-600/20 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="space-y-1 flex-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold">
              02. The Riskiest Assumption (Kill Switch)
            </span>
            <p className="text-sm md:text-base font-semibold text-zinc-100 leading-snug">
              {riskiestAssumption}
            </p>
            <p className="text-xs text-zinc-400 pt-1">
              If this single premise is false, the business has zero commercial velocity regardless of how elegant the codebase is.
            </p>
          </div>
        </div>
      </section>

      {/* AI What-If Scenario Feature Banner */}
      <section className="bg-[#101014] border border-zinc-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span className="text-xs font-bold text-zinc-100 font-display">
                AI "What If" Scenario Simulator
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-950 text-rose-400 border border-rose-900/60 rounded-xs">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-zinc-400 max-w-xl">
              Test hypothetical constraints: <span className="text-zinc-200">"What if I had 20 hours/week?"</span>, <span className="text-zinc-200">"What if my budget doubled?"</span>, or a customer pivot. See revised strategy, impacts, and an adjusted 7-day plan.
            </p>
          </div>

          <button
            onClick={onOpenWhatIf}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700/80 rounded-md transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Simulate 'What If'</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Saved Scenarios if any */}
        {scenarios && scenarios.length > 0 && (
          <div className="pt-3 border-t border-zinc-800/80 space-y-2">
            <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider font-medium block">
              Active Project Scenarios & Simulations ({scenarios.length})
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-md text-xs space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-zinc-200 truncate">
                      "{sc.scenarioPrompt}"
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-xs uppercase shrink-0 ${
                        sc.verdictOnScenario === 'WORTHWHILE_SHIFT'
                          ? 'bg-emerald-950 text-emerald-400'
                          : sc.verdictOnScenario === 'DISTRACTING_NOISE'
                          ? 'bg-rose-950 text-rose-400'
                          : 'bg-amber-950 text-amber-400'
                      }`}
                    >
                      {sc.verdictOnScenario.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">
                    {sc.verdictRationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 3. Evidence vs Assumption Separation */}
      <section className="bg-[#121215] border border-zinc-800 rounded-lg p-5 md:p-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 mb-1">
          03. Rigor Separation
        </div>
        <h2 className="text-base font-display font-bold text-zinc-100 mb-4">
          Known Evidence vs. Unvalidated Assumptions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Known Evidence */}
          <div className="space-y-3 p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                Known Evidence (Founder-Backed)
              </h4>
            </div>
            {evidenceVsAssumption.knownEvidence.length > 0 ? (
              <ul className="space-y-2 text-xs text-zinc-300">
                {evidenceVsAssumption.knownEvidence.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-emerald-500 font-mono">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-500 italic">
                Zero empirical data supplied yet. All assumptions must be proven in the 7-day sprint.
              </p>
            )}
          </div>

          {/* Unvalidated Assumptions */}
          <div className="space-y-3 p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-md">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                Unvalidated Assumptions (Risks)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-zinc-300">
              {evidenceVsAssumption.unvalidatedAssumptions.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-500 font-mono">⚠️</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Three Approaches & Tradeoffs */}
      <section className="bg-[#121215] border border-zinc-800 rounded-lg p-5 md:p-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 mb-1">
          04. Architectural Paths
        </div>
        <h2 className="text-base font-display font-bold text-zinc-100 mb-4">
          Three Possible Approaches with Explicit Tradeoffs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {threeApproaches.map((app, idx) => {
            const isRec =
              recommendedApproach.approachTitle.toLowerCase() === app.title.toLowerCase();
            return (
              <div
                key={idx}
                className={`p-4 rounded-md border flex flex-col justify-between transition-colors ${
                  isRec
                    ? 'bg-rose-950/20 border-rose-800/80'
                    : 'bg-zinc-900/40 border-zinc-800 text-zinc-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-zinc-500">0{idx + 1}</span>
                    {isRec && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-rose-900/60 text-rose-300 border border-rose-700/50 rounded-xs uppercase">
                        Recommended
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-semibold text-zinc-200 mb-2">{app.title}</h4>
                  <div className="text-[11px] font-mono text-zinc-400 mb-3">
                    Est. Time to Validate: <strong className="text-zinc-200">{app.estimatedDaysToValidate} days</strong>
                  </div>

                  <div className="space-y-2 text-xs mb-3">
                    <div>
                      <span className="text-emerald-400 font-medium">Pros: </span>
                      <span className="text-zinc-400">{app.pros.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-rose-400 font-medium">Cons: </span>
                      <span className="text-zinc-400">{app.cons.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-400 italic">
                  "{app.tradeoffs}"
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommended Approach callout */}
        <div className="mt-5 p-4 bg-zinc-900 border border-zinc-800 rounded-md">
          <h4 className="text-xs font-bold text-zinc-100 flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Recommended Choice: {recommendedApproach.approachTitle}</span>
          </h4>
          <p className="text-xs text-zinc-300 mb-2 leading-relaxed">
            {recommendedApproach.reasoning}
          </p>
          <p className="text-[11px] text-zinc-400">
            <strong>Why Alternatives Were Rejected:</strong> {recommendedApproach.whyNotOthers}
          </p>
        </div>
      </section>

      {/* 5. Deliberately Narrow MVP Scope vs. Do Not Build Yet */}
      <section className="bg-[#121215] border border-zinc-800 rounded-lg p-5 md:p-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 mb-1">
          05. Scoping Razor
        </div>
        <h2 className="text-base font-display font-bold text-zinc-100 mb-4">
          The Razor: What Makes the MVP vs. What We Redline
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Narrow MVP Scope */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-md space-y-3">
            <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
              <CheckCircle2 className="w-4 h-4" />
              <span>Deliberately Narrow MVP Scope (Only This)</span>
            </h4>
            <ul className="space-y-2 text-xs text-zinc-200">
              {narrowMvpScope.map((scope, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-500 font-mono">0{idx + 1}.</span>
                  <span>{scope}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Do Not Build Yet */}
          <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-md space-y-3">
            <h4 className="text-xs font-semibold text-rose-400 flex items-center gap-1.5 uppercase tracking-wide">
              <Ban className="w-4 h-4" />
              <span>Do Not Build Yet (Redlined Waste)</span>
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              {doNotBuildYet.map((waste, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-zinc-600 line-through">✕</span>
                  <span className="line-through decoration-zinc-600">{waste}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6. Validation Experiment & Measurable Success Gates */}
      <section className="bg-[#121215] border border-zinc-800 rounded-lg p-5 md:p-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 mb-1">
          06. Empirical Proof Test
        </div>
        <h2 className="text-base font-display font-bold text-zinc-100 mb-4">
          One Inexpensive Experiment & Measurable Gates
        </h2>

        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-md space-y-2 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="text-xs font-bold text-zinc-100">{validationExperiment.title}</h4>
            <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
              <span>Channel: <strong className="text-zinc-200">{validationExperiment.channel}</strong></span>
              <span>·</span>
              <span>Est. Cost: <strong className="text-rose-400">{validationExperiment.estimatedCost}</strong></span>
            </div>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {validationExperiment.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-zinc-900/60 border border-emerald-900/30 rounded-md space-y-1">
            <span className="text-[11px] font-mono uppercase text-emerald-400 font-semibold">
              Measurable Success Threshold
            </span>
            <p className="text-xs text-zinc-200 leading-relaxed font-medium">
              {successThreshold}
            </p>
          </div>

          <div className="p-4 bg-zinc-900/60 border border-rose-900/30 rounded-md space-y-1">
            <span className="text-[11px] font-mono uppercase text-rose-400 font-semibold">
              Stop or Pivot Condition (Kill Gate)
            </span>
            <p className="text-xs text-zinc-200 leading-relaxed font-medium">
              {stopOrPivotCondition}
            </p>
          </div>
        </div>
      </section>

      {/* Footer Navigation CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <button
          onClick={onRegenerate}
          disabled={isGenerating}
          className="text-xs text-zinc-400 hover:text-zinc-200 underline cursor-pointer"
        >
          Re-analyze with updated assumptions
        </button>

        <button
          onClick={onGoToSprint}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors shadow-xs shadow-rose-950 cursor-pointer"
        >
          <span>Open 7-Day Sprint Execution Plan</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
