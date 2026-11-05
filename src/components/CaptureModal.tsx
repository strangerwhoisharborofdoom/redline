import React, { useState } from 'react';
import { ProjectInput, CurrencyCode, SUPPORTED_CURRENCIES } from '../types';
import { EXAMPLE_PRESETS } from '../utils/presets';
import { X, Sparkles, BookOpen, Clock, AlertCircle, ArrowRight, Loader2, Check } from 'lucide-react';

interface CaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: ProjectInput) => Promise<void>;
  initialInput?: ProjectInput;
  isSubmitting: boolean;
}

const COMMON_SKILLS = [
  'TypeScript',
  'React',
  'Node.js',
  'Python',
  'Figma',
  'Cold Outreach',
  'Direct Sales',
  'SEO / Content',
  'Docker',
  'API Integrations',
];

export const CaptureModal: React.FC<CaptureModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialInput,
  isSubmitting,
}) => {
  const [title, setTitle] = useState(initialInput?.title || '');
  const [idea, setIdea] = useState(initialInput?.idea || '');
  const [targetCustomer, setTargetCustomer] = useState(initialInput?.targetCustomer || '');
  const [hoursPerWeek, setHoursPerWeek] = useState<number>(initialInput?.hoursPerWeek || 14);
  const [budgetAmount, setBudgetAmount] = useState<number>(initialInput?.budgetAmount ?? 5000);
  const [budgetCurrency, setBudgetCurrency] = useState<CurrencyCode>(
    initialInput?.budgetCurrency || 'INR'
  );
  const [skills, setSkills] = useState<string[]>(
    initialInput?.skills || ['TypeScript', 'React', 'Node.js']
  );
  const [skillInput, setSkillInput] = useState('');
  const [biggestConstraint, setBiggestConstraint] = useState(
    initialInput?.biggestConstraint || ''
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleLoadPreset = (presetIndex: number) => {
    const preset = EXAMPLE_PRESETS[presetIndex];
    if (!preset) return;
    setTitle(preset.data.title);
    setIdea(preset.data.idea);
    setTargetCustomer(preset.data.targetCustomer);
    setHoursPerWeek(preset.data.hoursPerWeek);
    setBudgetAmount(preset.data.budgetAmount);
    setBudgetCurrency(preset.data.budgetCurrency);
    setSkills(preset.data.skills);
    setBiggestConstraint(preset.data.biggestConstraint);
    setErrorMessage(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || idea.trim().length < 10) {
      setErrorMessage('Please provide at least a brief description of what you are trying to build (min 10 characters).');
      return;
    }
    if (hoursPerWeek <= 0 || hoursPerWeek > 100) {
      setErrorMessage('Hours available per week must be between 1 and 100.');
      return;
    }

    setErrorMessage(null);
    try {
      await onSubmit({
        title: title.trim() || idea.slice(0, 32).trim() + '...',
        idea: idea.trim(),
        targetCustomer: targetCustomer.trim() || 'Unspecified target customer',
        hoursPerWeek: Number(hoursPerWeek),
        budgetAmount: Number(budgetAmount),
        budgetCurrency,
        skills,
        biggestConstraint: biggestConstraint.trim() || 'Time and bandwidth constraints',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to analyze project idea. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-rose-600 rounded-xs" />
            <h2 className="font-display font-semibold text-base text-zinc-100">
              {initialInput ? 'Refine Project Parameters' : 'Capture New Validation Sprint'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Example Presets Bar */}
        <div className="px-6 py-2.5 bg-zinc-900/60 border-b border-zinc-800/60 flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>Load real founder example:</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {EXAMPLE_PRESETS.map((p, idx) => (
              <button
                key={p.label}
                type="button"
                onClick={() => handleLoadPreset(idx)}
                className="px-2 py-1 text-[11px] font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 rounded-xs transition-colors cursor-pointer"
              >
                {p.label.split('—')[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmitForm} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-md text-xs text-rose-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Project Title */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Project / Working Name
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. PulseCollect — WhatsApp Gym Chaser"
              className="w-full px-3.5 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            />
          </div>

          {/* Primary Idea Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-200">
                What are you trying to build? <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-zinc-400">Messy brain dump welcomed</span>
            </div>
            <textarea
              required
              rows={4}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Dump your idea here without sugarcoating. Who is it for, what manual mess does it replace, and why hasn't it been solved with an existing spreadsheet or script?"
              className="w-full px-3.5 py-2.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors leading-relaxed resize-y"
            />
          </div>

          {/* Target Customer */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Target Customer & Exact Niche
            </label>
            <input
              type="text"
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              placeholder="e.g. Independent gym & CrossFit studio owners (200-600 members) in Bangalore"
              className="w-full px-3.5 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors"
            />
          </div>

          {/* Hours and Budget Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Hours available per week */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Hours available per week</span>
                </label>
                <span className="font-mono text-xs text-rose-400 font-semibold">
                  {hoursPerWeek} hrs
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={80}
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Math.max(1, Number(e.target.value)))}
                  className="w-24 px-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-hidden focus:border-rose-500"
                />
                <div className="flex items-center gap-1">
                  {[7, 14, 21, 28].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setHoursPerWeek(preset)}
                      className={`px-2 py-1 text-[11px] font-mono rounded-xs border transition-colors cursor-pointer ${
                        hoursPerWeek === preset
                          ? 'bg-rose-950 border-rose-700 text-rose-200'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {preset}h
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Sprint tasks will be mathematically capped to this capacity.
              </p>
            </div>

            {/* Budget with INR default */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-300">
                  Total Validation Budget
                </label>
                <span className="text-[11px] text-zinc-400">Default: INR (₹)</span>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={budgetCurrency}
                  onChange={(e) => setBudgetCurrency(e.target.value as CurrencyCode)}
                  className="px-2.5 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-md text-zinc-200 focus:outline-hidden focus:border-rose-500"
                >
                  {Object.values(SUPPORTED_CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol})
                    </option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2 text-xs text-zinc-400 font-mono">
                    {SUPPORTED_CURRENCIES[budgetCurrency].symbol}
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full pl-7 pr-3 py-2 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                For test domain, APIs, or fuel/coffee meetings.
              </p>
            </div>
          </div>

          {/* Skills Tag Input */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Your Core Skills & Unfair Advantages
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-zinc-800 border border-zinc-700/80 rounded-md text-zinc-200"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-zinc-400 hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill(skillInput);
                  }
                }}
                placeholder="Type skill and press enter..."
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => handleAddSkill(skillInput)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded-md transition-colors"
              >
                Add
              </button>
            </div>

            {/* Quick Skill Recommendations */}
            <div className="flex flex-wrap items-center gap-1 text-[11px] text-zinc-400">
              <span className="text-zinc-400 mr-1">Suggestions:</span>
              {COMMON_SKILLS.filter((s) => !skills.includes(s)).slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleAddSkill(s)}
                  className="text-zinc-400 hover:text-zinc-200 hover:underline"
                >
                  +{s}
                </button>
              ))}
            </div>
          </div>

          {/* Biggest Constraint */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Biggest Constraint (The Bottleneck)
            </label>
            <input
              type="text"
              value={biggestConstraint}
              onChange={(e) => setBiggestConstraint(e.target.value)}
              placeholder="e.g. Full-time job (capped at 2 hours on weekdays), no preexisting audience, zero ad budget"
              className="w-full px-3.5 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          {/* Submit CTA */}
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 disabled:opacity-50 rounded-md transition-colors shadow-xs shadow-rose-950 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Redline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-rose-200" />
                  <span>Find my Redline</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
