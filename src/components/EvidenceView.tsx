import React, { useState } from 'react';
import { EvidenceLog, EvidenceStatus } from '../types';
import {
  Plus,
  Calendar,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Trash2,
  Edit2,
  FileText,
  Filter,
  ArrowRight,
} from 'lucide-react';

interface EvidenceViewProps {
  logs: EvidenceLog[];
  onAddLog: (log: Omit<EvidenceLog, 'id'>) => void;
  onUpdateLog: (id: string, patch: Partial<EvidenceLog>) => void;
  onDeleteLog: (id: string) => void;
  onGoToReview: () => void;
}

export const EvidenceView: React.FC<EvidenceViewProps> = ({
  logs,
  onAddLog,
  onUpdateLog,
  onDeleteLog,
  onGoToReview,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<EvidenceStatus | 'ALL'>('ALL');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [source, setSource] = useState('');
  const [observation, setObservation] = useState('');
  const [status, setStatus] = useState<EvidenceStatus>('Validated');
  const [notes, setNotes] = useState('');

  // Edit State
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const handleCreateLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!source.trim() || !observation.trim()) return;

    onAddLog({
      date,
      source: source.trim(),
      observation: observation.trim(),
      status,
      notes: notes.trim() || undefined,
    });

    // Reset
    setSource('');
    setObservation('');
    setNotes('');
    setShowAddForm(false);
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === 'ALL') return true;
    return log.status === filter;
  });

  const validatedCount = logs.filter((l) => l.status === 'Validated').length;
  const invalidatedCount = logs.filter((l) => l.status === 'Invalidated').length;
  const inconclusiveCount = logs.filter((l) => l.status === 'Inconclusive').length;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Evidence Overview Header */}
      <div className="bg-[#121215] border border-zinc-800 rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-500 font-semibold">
              Field Empirical Log
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-400">Zero Speculation</span>
          </div>
          <h2 className="text-lg font-display font-bold text-zinc-100">
            Customer Evidence Registry
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Record direct customer behavior, cold objections, payment proof, or prototype feedback. Evidence is what prevents building unwanted software.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log Field Evidence</span>
        </button>
      </div>

      {/* Filter and Count Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Interactive filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer ${
              filter === 'ALL'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All Logs ({logs.length})
          </button>
          <button
            onClick={() => setFilter('Validated')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'Validated'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'text-zinc-400 hover:text-emerald-400'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validated ({validatedCount})</span>
          </button>
          <button
            onClick={() => setFilter('Invalidated')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'Invalidated'
                ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                : 'text-zinc-400 hover:text-rose-400'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>Invalidated ({invalidatedCount})</span>
          </button>
          <button
            onClick={() => setFilter('Inconclusive')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
              filter === 'Inconclusive'
                ? 'bg-amber-950/80 border border-amber-800 text-amber-300'
                : 'text-zinc-400 hover:text-amber-400'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Inconclusive ({inconclusiveCount})</span>
          </button>
        </div>

        <div className="text-[11px] text-zinc-400 font-mono">
          Only verifiable user reactions count as evidence.
        </div>
      </div>

      {/* Add Evidence Modal / Accordion */}
      {showAddForm && (
        <form
          onSubmit={handleCreateLog}
          className="bg-[#121215] border border-zinc-700/80 rounded-lg p-5 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-rose-400">
              New Field Observation
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-hidden focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Source / Channel
              </label>
              <input
                type="text"
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g. 5 Gym In-Person Walk-ins"
                className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Outcome Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as EvidenceStatus)}
                className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-hidden focus:border-rose-500"
              >
                <option value="Validated">Validated (Strong Positive Proof)</option>
                <option value="Invalidated">Invalidated (Assumption Disproved)</option>
                <option value="Inconclusive">Inconclusive (Weak or Mixed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Direct Observation (What Did They Actually Do?)
            </label>
            <textarea
              required
              rows={3}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Describe actual behavior, exact quotes, clicks, or payments. Avoid interpretations like 'they loved it'."
              className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Founder Interpretation / Reflection (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Confirms that manual texting is embarrassing for front-desk staff."
              className="w-full px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors"
            >
              Save Observation
            </button>
          </div>
        </form>
      )}

      {/* Evidence Logs List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center bg-[#121215] border border-zinc-800 rounded-lg">
            <FileText className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <h4 className="text-xs font-semibold text-zinc-300 mb-1">
              No evidence logged for this filter
            </h4>
            <p className="text-xs text-zinc-500 mb-4">
              Add your field notes, customer quotes, or test conversion numbers.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 underline"
            >
              Log your first observation
            </button>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isEditing = editingLogId === log.id;
            return (
              <div
                key={log.id}
                className="p-4 bg-[#121215] border border-zinc-800 hover:border-zinc-700/80 rounded-lg transition-colors space-y-2"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    {log.status === 'Validated' && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-emerald-950/80 text-emerald-400 border border-emerald-900/60 rounded-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        VALIDATED
                      </span>
                    )}
                    {log.status === 'Invalidated' && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-rose-950/80 text-rose-400 border border-rose-900/60 rounded-xs flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        INVALIDATED
                      </span>
                    )}
                    {log.status === 'Inconclusive' && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-amber-950/80 text-amber-400 border border-amber-900/60 rounded-xs flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" />
                        INCONCLUSIVE
                      </span>
                    )}

                    <h4 className="text-xs font-bold text-zinc-100">{log.source}</h4>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-zinc-400">
                    <span className="font-mono tabular-nums flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-zinc-500" />
                      {log.date}
                    </span>
                    <button
                      onClick={() => onDeleteLog(log.id)}
                      title="Delete log"
                      className="text-zinc-500 hover:text-rose-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                  {log.observation}
                </p>

                {log.notes && (
                  <div className="pt-2 text-[11px] text-zinc-400 border-t border-zinc-800/60">
                    <span className="text-zinc-500 font-medium">Reflection: </span>
                    <span>{log.notes}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Navigation CTA */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
        <div className="text-xs text-zinc-400">
          <span>Total Evidence Recorded: </span>
          <strong className="text-zinc-200">{logs.length} items</strong>
        </div>

        <button
          onClick={onGoToReview}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors shadow-xs shadow-rose-950 cursor-pointer"
        >
          <span>Synthesize Review & Verdict</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
