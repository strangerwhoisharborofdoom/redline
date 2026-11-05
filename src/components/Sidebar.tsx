import React from 'react';
import { Project } from '../types';
import {
  Compass,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  FlaskConical,
  X,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onDeleteRequest: (id: string, e: React.MouseEvent) => void;
  onOpenTests: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDeleteRequest,
  onOpenTests,
  isOpenMobile,
  onCloseMobile,
}) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#0d0d10] border-r border-zinc-800/80 flex flex-col transition-transform duration-200 ease-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-zinc-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-sm bg-rose-600 flex items-center justify-center shadow-xs shadow-rose-950">
              <div className="w-2.5 h-0.5 bg-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-bold tracking-tight text-base text-zinc-100">
                  REDLINE
                </span>
                <span className="text-[10px] font-mono tracking-wider text-rose-500 uppercase px-1 py-0.2 bg-rose-950/60 border border-rose-900/50 rounded-xs">
                  v1
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal truncate">
                Cut noise. Ship what matters.
              </p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-zinc-800"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action: New Sprint */}
        <div className="p-4 border-b border-zinc-800/60">
          <button
            onClick={() => {
              onNewProject();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:bg-rose-700 rounded-md transition-colors shadow-xs shadow-rose-950 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-rose-500/50"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Validation Sprint</span>
          </button>
        </div>

        {/* Projects Section */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400 flex items-center justify-between">
            <span>Validation Sprints</span>
            <span className="font-mono text-[10px] text-zinc-400">{projects.length}</span>
          </div>

          {projects.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-zinc-400">
              No sprints yet. Click above to find your first Redline.
            </div>
          ) : (
            projects.map((project) => {
              const isActive = project.id === activeProjectId;
              const totalTasks = project.sprintTasks.length;
              const completedTasks = project.sprintTasks.filter((t) => t.isCompleted).length;
              const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
              const isDemo = project.isDemo;

              return (
                <div
                  key={project.id}
                  onClick={() => {
                    onSelectProject(project.id);
                    onCloseMobile();
                  }}
                  className={`group relative flex items-start justify-between p-2.5 rounded-md cursor-pointer transition-colors border ${
                    isActive
                      ? 'bg-zinc-800/80 border-zinc-700/80 text-zinc-100 shadow-xs'
                      : 'border-transparent text-zinc-300 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      {isDemo && (
                        <span className="text-[10px] font-mono px-1 py-0.2 bg-amber-950/60 text-amber-400 border border-amber-900/40 rounded-xs">
                          DEMO
                        </span>
                      )}
                      <h4 className="text-xs font-medium truncate">
                        {project.input.title || 'Untitled Sprint'}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {project.input.hoursPerWeek}h
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2
                          className={`w-3 h-3 ${pct === 100 ? 'text-emerald-500' : 'text-zinc-400'}`}
                        />
                        {completedTasks}/{totalTasks}
                      </span>
                      <span>·</span>
                      <span>{pct}%</span>
                    </div>

                    {/* Mini progress line */}
                    <div className="mt-2 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          pct === 100
                            ? 'bg-emerald-500'
                            : isActive
                            ? 'bg-rose-500'
                            : 'bg-zinc-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 pt-0.5">
                    <button
                      onClick={(e) => onDeleteRequest(project.id, e)}
                      title="Delete project"
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-rose-400 rounded-xs hover:bg-zinc-700/50 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${
                        isActive ? 'text-rose-400' : 'text-zinc-600 group-hover:text-zinc-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 space-y-2 shrink-0">
          <button
            onClick={onOpenTests}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-md transition-colors border border-zinc-800/60 cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <FlaskConical className="w-3.5 h-3.5 text-rose-400" />
              <span>Diagnostic Tests</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400">14 passing</span>
          </button>

          <div className="px-2 py-1 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Local persistence</span>
            <span className="text-emerald-500 font-mono">Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
