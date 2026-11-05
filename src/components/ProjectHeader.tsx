import React, { useState } from 'react';
import { Project, CurrencyCode, SUPPORTED_CURRENCIES } from '../types';
import { exportProjectAsMarkdown, exportProjectAsJson } from '../utils/exportPlan';
import {
  Menu,
  Download,
  Settings2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  FileText,
  FileCode,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

interface ProjectHeaderProps {
  project: Project;
  activeTab: 'strategy' | 'sprint' | 'evidence' | 'review';
  onTabChange: (tab: 'strategy' | 'sprint' | 'evidence' | 'review') => void;
  onEditInput: () => void;
  onDeleteRequest: () => void;
  onImportProject?: (imported: Project) => void;
  onOpenMobileMenu: () => void;
}

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  activeTab,
  onTabChange,
  onEditInput,
  onDeleteRequest,
  onImportProject,
  onOpenMobileMenu,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.input && parsed.sprintTasks) {
          onImportProject?.(parsed);
        } else {
          alert('Invalid Redline plan JSON file.');
        }
      } catch {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowExportMenu(false);
  };

  const totalTasks = project.sprintTasks.length;
  const completedTasks = project.sprintTasks.filter((t) => t.isCompleted).length;
  const totalHours = project.sprintTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
  const roundedHours = Math.round(totalHours * 10) / 10;
  const capacity = project.input.hoursPerWeek;
  const currencySymbol = SUPPORTED_CURRENCIES[project.input.budgetCurrency]?.symbol || '₹';
  const isDemo = project.isDemo;
  const isFallback = project.strategy?.isDemoOrFallback;

  return (
    <header className="border-b border-zinc-800/80 bg-[#0c0c0e] sticky top-0 z-30">
      {/* Top Bar Row */}
      <div className="px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Project title */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800"
            aria-label="Toggle navigation drawer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display font-bold text-base md:text-lg text-zinc-100 truncate">
                {project.input.title || 'Untitled Sprint'}
              </h1>
              {isDemo && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-950/60 text-amber-400 border border-amber-900/40 rounded-xs uppercase tracking-wider">
                  Demo
                </span>
              )}
              {isFallback && !isDemo && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xs">
                  Fallback Mode
                </span>
              )}
              {!isFallback && !isDemo && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Gemini 3.8 Flash
                </span>
              )}
            </div>

            {/* Unboxed metadata line with typographic separators */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5 font-normal truncate">
              <span className="truncate max-w-[280px] sm:max-w-md">
                {project.input.targetCustomer}
              </span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="font-mono tabular-nums text-zinc-300">
                {currencySymbol} {project.input.budgetAmount.toLocaleString()}
              </span>
              <span aria-hidden="true" className="text-zinc-600">·</span>
              <span className="font-mono tabular-nums text-zinc-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-500" />
                {roundedHours}h / {capacity}h max
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Export Menu */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 rounded-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-1 w-48 bg-[#18181b] border border-zinc-700 rounded-md shadow-xl py-1 z-40 text-xs">
                  <button
                    onClick={() => {
                      exportProjectAsMarkdown(project);
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-zinc-200 hover:bg-zinc-700/60 transition-colors text-left"
                  >
                    <FileText className="w-4 h-4 text-rose-400" />
                    <span>Export as Markdown (.md)</span>
                  </button>
                  <button
                    onClick={() => {
                      exportProjectAsJson(project);
                      setShowExportMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-zinc-200 hover:bg-zinc-700/60 transition-colors text-left"
                  >
                    <FileCode className="w-4 h-4 text-rose-400" />
                    <span>Export Structured JSON</span>
                  </button>
                  <div className="my-1 border-t border-zinc-700/60" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center gap-2 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-700/60 transition-colors text-left"
                  >
                    <Download className="w-4 h-4 text-emerald-400 rotate-180" />
                    <span>Import Plan (.json)</span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </>
            )}
          </div>

          {/* Edit Parameters */}
          <button
            onClick={onEditInput}
            title="Edit input parameters"
            className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
            aria-label="Edit project parameters"
          >
            <Settings2 className="w-4 h-4" />
          </button>

          {/* Delete Project */}
          <button
            onClick={onDeleteRequest}
            title="Delete project"
            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-md transition-colors"
            aria-label="Delete sprint"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="px-4 md:px-8 flex items-center gap-2 overflow-x-auto scrollbar-none border-t border-zinc-800/40">
        <button
          onClick={() => onTabChange('strategy')}
          className={`py-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors relative cursor-pointer ${
            activeTab === 'strategy'
              ? 'text-rose-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>1. Strategy & Scope</span>
          {activeTab === 'strategy' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />
          )}
        </button>

        <button
          onClick={() => onTabChange('sprint')}
          className={`py-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors relative cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'sprint'
              ? 'text-rose-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>2. 7-Day Sprint Plan</span>
          <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded-xs">
            {completedTasks}/{totalTasks}
          </span>
          {activeTab === 'sprint' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />
          )}
        </button>

        <button
          onClick={() => onTabChange('evidence')}
          className={`py-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors relative cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'evidence'
              ? 'text-rose-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>3. Evidence Log</span>
          <span className="text-[10px] font-mono px-1 py-0.2 bg-zinc-800 text-zinc-300 rounded-xs">
            {project.evidenceLogs.length}
          </span>
          {activeTab === 'evidence' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />
          )}
        </button>

        <button
          onClick={() => onTabChange('review')}
          className={`py-3 px-3 text-xs font-semibold whitespace-nowrap transition-colors relative cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'review'
              ? 'text-rose-400'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <span>4. Review & Verdict</span>
          {project.review && (
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-xs uppercase ${
                project.review.verdict === 'CONTINUE'
                  ? 'bg-emerald-950 text-emerald-400'
                  : project.review.verdict === 'STOP'
                  ? 'bg-rose-950 text-rose-400'
                  : 'bg-amber-950 text-amber-400'
              }`}
            >
              {project.review.verdict}
            </span>
          )}
          {activeTab === 'review' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600" />
          )}
        </button>
      </div>
    </header>
  );
};
