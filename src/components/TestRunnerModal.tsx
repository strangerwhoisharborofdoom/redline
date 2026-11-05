import React, { useState, useEffect } from 'react';
import { runAllRedlineTests, TestResult } from '../utils/testSuite';
import {
  X,
  FlaskConical,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Check,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runAllRedlineTests();
      setResults(res);
      setIsRunning(false);
    }, 150);
  };

  useEffect(() => {
    if (isOpen) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  // Group by category
  const categories: Record<string, TestResult[]> = {};
  results.forEach((r) => {
    if (!categories[r.category]) categories[r.category] = [];
    categories[r.category].push(r);
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-rose-950/60 border border-rose-800/80 flex items-center justify-center text-rose-400">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base text-zinc-100">
                Redline Diagnostic Test Suite
              </h3>
              <p className="text-[11px] text-zinc-400">
                Verification for effort validation, persistence, task completion, export & AI fallback
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Scoreboard */}
        <div className="px-6 py-3 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{passedCount} Passed</span>
            </span>
            {failedCount > 0 && (
              <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                <XCircle className="w-4 h-4" />
                <span>{failedCount} Failed</span>
              </span>
            )}
            <span className="text-zinc-400">Total: {total} specifications</span>
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors cursor-pointer"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Re-run Suite</span>
          </button>
        </div>

        {/* Test List */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {Object.entries(categories).map(([category, tests]) => (
            <div key={category} className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center justify-between">
                <span>{category}</span>
                <span className="text-zinc-400 font-normal">
                  {tests.filter((t) => t.passed).length}/{tests.length} passed
                </span>
              </div>

              <div className="space-y-1.5">
                {tests.map((test) => (
                  <div
                    key={test.id}
                    className={`p-2.5 rounded-md border flex items-start justify-between gap-3 text-xs ${
                      test.passed
                        ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-300'
                        : 'bg-rose-950/30 border-rose-900 text-rose-300'
                    }`}
                  >
                    <div className="flex items-start gap-2 min-w-0 flex-1">
                      {test.passed ? (
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-medium text-zinc-200">{test.name}</div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">{test.message}</div>
                      </div>
                    </div>

                    <div className="font-mono text-[10px] text-zinc-400 shrink-0">
                      {test.durationMs}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>All tests execute client-side and server verification modules.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
