import React from 'react';
import { ReviewSynthesis, StrategyAnalysis, EvidenceLog, SprintTask } from '../types';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Compass,
  Loader2,
} from 'lucide-react';

interface ReviewViewProps {
  review: ReviewSynthesis | null;
  strategy: StrategyAnalysis | null;
  evidenceLogs: EvidenceLog[];
  sprintTasks: SprintTask[];
  onSynthesizeReview: () => void;
  isSynthesizing: boolean;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  review,
  strategy,
  evidenceLogs,
  sprintTasks,
  onSynthesizeReview,
  isSynthesizing,
}) => {
  const completedTasks = sprintTasks.filter((t) => t.isCompleted).length;
  const totalTasks = sprintTasks.length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Review Header Banner */}
      <div className="bg-[#121215] border border-zinc-800 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-500 font-semibold">
              04. Retrospective & Gate Audit
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-400">Strict Truth Test</span>
          </div>
          <h2 className="text-lg font-display font-bold text-zinc-100">
            Sprint Review & Go/No-Go Decision
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Audit your recorded evidence against your original kill gates. Distinguish verified facts from founder optimism.
          </p>
        </div>

        <button
          onClick={onSynthesizeReview}
          disabled={isSynthesizing}
          className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 rounded-md transition-colors shadow-xs shadow-rose-950 cursor-pointer shrink-0"
        >
          {isSynthesizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating Evidence...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-rose-200" />
              <span>{review ? 'Re-Synthesize Verdict' : 'Synthesize Review & Verdict'}</span>
            </>
          )}
        </button>
      </div>

      {/* Inputs Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-md">
          <span className="text-zinc-500 font-medium block mb-1">Sprint Progress</span>
          <span className="font-mono text-zinc-200 font-semibold">
            {completedTasks} of {totalTasks} deliverables finished
          </span>
        </div>
        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-md">
          <span className="text-zinc-500 font-medium block mb-1">Evidence Records</span>
          <span className="font-mono text-zinc-200 font-semibold">
            {evidenceLogs.length} total observations logged
          </span>
        </div>
        <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-md">
          <span className="text-zinc-500 font-medium block mb-1">Success Target</span>
          <span className="text-zinc-300 font-medium truncate block" title={strategy?.successThreshold}>
            {strategy?.successThreshold || 'Unspecified gate'}
          </span>
        </div>
      </div>

      {!review ? (
        <div className="p-12 text-center bg-[#121215] border border-zinc-800 rounded-lg">
          <Compass className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-display font-semibold text-base text-zinc-200 mb-1">
            Verdict Not Yet Synthesized
          </h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto mb-5 leading-relaxed">
            Synthesize your recorded field observations, sprint deliverables, and the strategic failure gates into an objective verdict.
          </p>
          <button
            onClick={onSynthesizeReview}
            disabled={isSynthesizing}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Decision Verdict</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Verdict Card */}
          <div
            className={`p-6 rounded-lg border relative overflow-hidden ${
              review.verdict === 'CONTINUE'
                ? 'bg-emerald-950/20 border-emerald-800/80'
                : review.verdict === 'STOP'
                ? 'bg-rose-950/20 border-rose-800/80'
                : 'bg-amber-950/20 border-amber-800/80'
            }`}
          >
            <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold block mb-1">
                  Strategic Recommendation
                </span>
                <div className="flex items-center gap-3">
                  <h3
                    className={`font-display font-black text-2xl md:text-3xl tracking-tight ${
                      review.verdict === 'CONTINUE'
                        ? 'text-emerald-400'
                        : review.verdict === 'STOP'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    VERDICT: {review.verdict}
                  </h3>
                  {review.isDemoOrFallback && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-xs">
                      Demo Mode
                    </span>
                  )}
                </div>
              </div>

              <div className="text-[11px] font-mono text-zinc-400">
                Audited: {new Date(review.generatedAt).toLocaleDateString()}
              </div>
            </div>

            <p className="text-sm font-medium text-zinc-200 leading-relaxed mb-4">
              {review.verdictSummary}
            </p>

            {/* Immediate Next Step Callout */}
            <div className="p-4 bg-zinc-900/90 border border-zinc-700/80 rounded-md">
              <span className="text-[11px] font-mono uppercase text-rose-400 font-bold tracking-wide flex items-center gap-1.5 mb-1">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Immediate Next Action (Do This Today)</span>
              </span>
              <p className="text-xs font-semibold text-zinc-100 leading-relaxed">
                {review.immediateNextStep}
              </p>
            </div>
          </div>

          {/* Rigorous Evidence vs Assumption Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Proven by Evidence */}
            <div className="bg-[#121215] border border-zinc-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  Proven by Direct Evidence (Empirical)
                </h4>
              </div>
              <p className="text-[11px] text-zinc-400">
                Facts strictly derived from your recorded logs and deliverables:
              </p>
              {review.provenByEvidence.length > 0 ? (
                <ul className="space-y-2 text-xs text-zinc-200">
                  {review.provenByEvidence.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-emerald-500 font-mono">✅</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-zinc-400 italic">
                  No empirical customer actions verified yet.
                </p>
              )}
            </div>

            {/* Unvalidated Assumptions Remaining */}
            <div className="bg-[#121215] border border-zinc-800 rounded-lg p-5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                  Unvalidated Assumptions Remaining
                </h4>
              </div>
              <p className="text-[11px] text-zinc-400">
                Critical risks you have not yet proven with real customer behavior:
              </p>
              <ul className="space-y-2 text-xs text-zinc-300">
                {review.unvalidatedAssumptions.map((u, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-amber-500 font-mono">⚠️</span>
                    <span>{u}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Detailed Rationale */}
          <div className="bg-[#121215] border border-zinc-800 rounded-lg p-5 space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Detailed Synthesis Rationale
            </h4>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {review.detailedRationale}
            </p>
          </div>

          {/* Original Gates Comparison */}
          {strategy && (
            <div className="bg-[#121215] border border-zinc-800 rounded-lg p-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Comparison Against Initial Gates
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md">
                  <span className="text-zinc-500 font-medium block mb-1">
                    Validation Target:
                  </span>
                  <span className="text-zinc-200">{strategy.successThreshold}</span>
                </div>
                <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-md">
                  <span className="text-zinc-500 font-medium block mb-1">
                    Stop / Pivot Gate:
                  </span>
                  <span className="text-zinc-200">{strategy.stopOrPivotCondition}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
