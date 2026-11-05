import React, { useState } from 'react';
import { SprintTask, ProjectInput } from '../types';
import { validateEffortBudget, enforceEffortBudget } from '../utils/validation';
import {
  Check,
  CheckCircle2,
  Clock,
  Package,
  Link2,
  Edit2,
  Plus,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface SprintViewProps {
  tasks: SprintTask[];
  capacityHours: number;
  onToggleTask: (taskId: string, isCompleted: boolean) => void;
  onEditTask: (task: SprintTask) => void;
  onAddTask: (dayNumber: number) => void;
  onRebalanceEffort: (rebalancedTasks: SprintTask[]) => void;
  onGoToEvidence: () => void;
}

export const SprintView: React.FC<SprintViewProps> = ({
  tasks,
  capacityHours,
  onToggleTask,
  onEditTask,
  onAddTask,
  onRebalanceEffort,
  onGoToEvidence,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [selectedDay, setSelectedDay] = useState<number | 'ALL'>('ALL');

  const effortResult = validateEffortBudget(tasks, capacityHours);

  // Group tasks by Day (1 to 7)
  const daysGrouped: Record<number, SprintTask[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
  };

  tasks.forEach((t) => {
    const d = t.dayNumber >= 1 && t.dayNumber <= 7 ? t.dayNumber : 1;
    // Apply status filter
    if (statusFilter === 'PENDING' && t.isCompleted) return;
    if (statusFilter === 'COMPLETED' && !t.isCompleted) return;
    daysGrouped[d].push(t);
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Identify current active day (first day with incomplete tasks)
  const activeDayNumber =
    [1, 2, 3, 4, 5, 6, 7].find((d) => {
      const dayAllTasks = tasks.filter((t) => t.dayNumber === d);
      return dayAllTasks.length > 0 && dayAllTasks.some((t) => !t.isCompleted);
    }) || 1;

  const handleAutoRebalance = () => {
    const adjusted = enforceEffortBudget(tasks, capacityHours);
    onRebalanceEffort(adjusted);
  };

  const daysToRender = selectedDay === 'ALL' ? [1, 2, 3, 4, 5, 6, 7] : [selectedDay];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Sprint Header & Capacity Tracker Strip */}
      <div className="bg-[#121215] border border-zinc-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-rose-500 font-semibold">
              Execution Sprint
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-400">7 Consecutive Days</span>
          </div>
          <h2 className="text-lg font-display font-bold text-zinc-100">
            Validation Execution Engine
          </h2>
        </div>

        {/* Effort & Capacity Progress Bar */}
        <div className="w-full md:w-80 bg-zinc-900 border border-zinc-800/90 rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Effort Scheduled:</span>
            </span>
            <span className="font-mono tabular-nums text-zinc-200">
              <strong
                className={
                  effortResult.isValid ? 'text-zinc-100' : 'text-rose-400 font-bold'
                }
              >
                {effortResult.totalEffortHours}h
              </strong>{' '}
              / {effortResult.capacityHours}h
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full transition-all duration-300 ${
                effortResult.isValid ? 'bg-rose-600' : 'bg-rose-500'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  (effortResult.totalEffortHours / effortResult.capacityHours) * 100
                )}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>
              Sprint completion: <strong className="text-zinc-200">{progressPct}%</strong> ({completedTasks}/{totalTasks})
            </span>
            {!effortResult.isValid && (
              <button
                onClick={handleAutoRebalance}
                className="text-rose-400 hover:text-rose-300 underline font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Fit to {capacityHours}h</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overflow Alert if any */}
      {!effortResult.isValid && (
        <div className="p-3.5 bg-rose-950/40 border border-rose-900/60 rounded-lg flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              Total sprint effort ({effortResult.totalEffortHours}h) exceeds your weekly available capacity ({effortResult.capacityHours}h) by {effortResult.overflowHours} hours.
            </span>
          </div>
          <button
            onClick={handleAutoRebalance}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-md text-xs font-semibold cursor-pointer shrink-0"
          >
            Auto-Scale Tasks
          </button>
        </div>
      )}

      {/* 100% Completion Celebration Banner */}
      {progressPct === 100 && totalTasks > 0 && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-800/80 rounded-lg flex items-center justify-between gap-3 text-xs text-emerald-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-emerald-100 font-semibold block">
                7-Day Sprint Finished!
              </strong>
              <span>All validation deliverables are complete. Record your final observations in the Evidence Log and synthesize your Go/No-Go verdict.</span>
            </div>
          </div>
          <button
            onClick={onGoToEvidence}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-md transition-colors cursor-pointer shrink-0"
          >
            Go to Evidence
          </button>
        </div>
      )}

      {/* Interactive Controls Strip: Day Selector & Status Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-1 border-b border-zinc-800/60">
        {/* Day Focus Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 text-xs">
          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer whitespace-nowrap ${
              selectedDay === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All 7 Days
          </button>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDay(d)}
              className={`px-2.5 py-1.5 rounded-md font-mono text-[11px] transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                selectedDay === d
                  ? 'bg-rose-950 border border-rose-800 text-rose-200 font-bold'
                  : d === activeDayNumber
                  ? 'bg-zinc-900 border border-zinc-800 text-rose-400'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span>D{d}</span>
              {d === activeDayNumber && (
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block" />
              )}
            </button>
          ))}
        </div>

        {/* Task Status Filters */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-zinc-800 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            All ({totalTasks})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-rose-950/80 border border-rose-800 text-rose-300'
                : 'text-zinc-400 hover:text-rose-400'
            }`}
          >
            Pending ({totalTasks - completedTasks})
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-2.5 py-1 font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                : 'text-zinc-400 hover:text-emerald-400'
            }`}
          >
            Done ({completedTasks})
          </button>
        </div>
      </div>

      {/* The 7-Day Plan with the Signature Red Line Spine */}
      <div className="relative pl-6 md:pl-10 space-y-8">
        {/* The Signature Red Line Connector */}
        <div
          aria-hidden="true"
          className="absolute left-2.5 md:left-4 top-4 bottom-8 w-0.5 bg-gradient-to-b from-rose-600 via-rose-700 to-rose-950 shadow-[0_0_8px_rgba(225,29,72,0.3)]"
        />

        {daysToRender.map((dayNumber) => {
          const dayTasks = daysGrouped[dayNumber] || [];
          const dayHours = effortResult.dailyHours[dayNumber] || 0;
          const isDayComplete =
            dayTasks.length > 0 && dayTasks.every((t) => t.isCompleted);
          const hasAnyTask = dayTasks.length > 0;

          return (
            <div key={dayNumber} className="relative group">
              {/* Day Redline Node marker */}
              <div
                className={`absolute -left-6 md:-left-10 top-2.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  isDayComplete
                    ? 'bg-rose-600 border-rose-400 text-white shadow-[0_0_10px_rgba(225,29,72,0.5)]'
                    : hasAnyTask
                    ? 'bg-[#09090b] border-rose-600 text-rose-400'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-500'
                }`}
              >
                {isDayComplete ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : (
                  <span className="text-[10px] font-mono font-bold">{dayNumber}</span>
                )}
              </div>

              {/* Day Container Card */}
              <div className="bg-[#121215] border border-zinc-800 rounded-lg p-4 md:p-5 transition-colors group-hover:border-zinc-700/80">
                {/* Day Header Row */}
                <div className="flex items-center justify-between flex-wrap gap-2 pb-3 mb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2.5">
                    <h3 className="font-display font-bold text-sm md:text-base text-zinc-100">
                      Day 0{dayNumber}
                    </h3>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs font-mono text-zinc-400 tabular-nums">
                      {dayHours} hours allocated
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddTask(dayNumber)}
                      className="px-2 py-1 text-[11px] font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Task</span>
                    </button>
                  </div>
                </div>

                {/* Day Task List */}
                {dayTasks.length === 0 ? (
                  <div className="py-3 text-xs text-zinc-500 italic flex items-center justify-between">
                    <span>Rest, customer follow-up, or overflow buffer day.</span>
                    <button
                      onClick={() => onAddTask(dayNumber)}
                      className="text-rose-400 hover:text-rose-300 underline font-medium"
                    >
                      Assign Day {dayNumber} Task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3.5 rounded-md border transition-all ${
                          task.isCompleted
                            ? 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400'
                            : 'bg-zinc-900/80 border-zinc-700/80 text-zinc-200 shadow-xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Task Checkbox & Title */}
                          <div className="flex items-start gap-3 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => onToggleTask(task.id, !task.isCompleted)}
                              className={`mt-0.5 w-4.5 h-4.5 rounded-sm border flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                                task.isCompleted
                                  ? 'bg-rose-600 border-rose-500 text-white'
                                  : 'border-zinc-600 hover:border-rose-500 bg-zinc-900'
                              }`}
                              aria-label={
                                task.isCompleted ? 'Mark incomplete' : 'Mark complete'
                              }
                            >
                              {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                            </button>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-baseline gap-2 flex-wrap">
                                <h4
                                  className={`text-xs md:text-sm font-semibold truncate ${
                                    task.isCompleted
                                      ? 'line-through text-zinc-400'
                                      : 'text-zinc-100'
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                <span className="font-mono text-[11px] text-rose-400 tabular-nums">
                                  {task.estimatedHours}h est
                                  {task.actualHoursSpent !== undefined && (
                                    <span className="text-zinc-400 font-normal ml-1">
                                      · {task.actualHoursSpent}h logged
                                    </span>
                                  )}
                                </span>
                              </div>

                              <p
                                className={`text-xs mt-1 leading-relaxed ${
                                  task.isCompleted ? 'text-zinc-400' : 'text-zinc-300'
                                }`}
                              >
                                {task.description}
                              </p>

                              {/* Deliverable Callout */}
                              <div className="mt-2.5 pt-2 border-t border-zinc-800/60 flex items-center gap-2 text-xs flex-wrap">
                                <span className="text-zinc-400 flex items-center gap-1 font-medium">
                                  <Package className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Deliverable:</span>
                                </span>
                                <span
                                  className={`font-medium ${
                                    task.isCompleted
                                      ? 'text-zinc-400'
                                      : 'text-zinc-200'
                                  }`}
                                >
                                  {task.deliverable}
                                </span>
                              </div>

                              {/* Dependencies if any */}
                              {task.dependencies &&
                                task.dependencies.length > 0 &&
                                task.dependencies[0] !== 'None' && (
                                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-400">
                                    <Link2 className="w-3 h-3 text-zinc-400" />
                                    <span>Depends on: {task.dependencies.join(', ')}</span>
                                  </div>
                                )}

                              {/* Notes if recorded */}
                              {task.notes && (
                                <div className="mt-2 p-2 bg-zinc-950/70 border border-zinc-800 rounded-xs text-[11px] text-zinc-300">
                                  <strong className="text-zinc-400">Note:</strong> {task.notes}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Task Edit Button */}
                          <div className="shrink-0 flex items-center gap-1">
                            <button
                              onClick={() => onEditTask(task)}
                              title="Edit task details"
                              className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Navigation CTA */}
      <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
        <div className="text-xs text-zinc-400">
          <span>Sprint Tasks: </span>
          <strong className="text-zinc-200">
            {completedTasks} completed of {totalTasks}
          </strong>
        </div>

        <button
          onClick={onGoToEvidence}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors shadow-xs shadow-rose-950 cursor-pointer"
        >
          <span>Record Field Evidence in Log</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
