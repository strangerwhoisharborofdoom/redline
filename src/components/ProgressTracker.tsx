import React from 'react';
import { SprintTask } from '../types';
import { validateEffortBudget } from '../utils/validation';
import {
  CheckCircle2,
  Clock,
  Circle,
  AlertCircle,
  Flame,
  CalendarCheck2,
} from 'lucide-react';

interface ProgressTrackerProps {
  tasks: SprintTask[];
  capacityHours: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  tasks,
  capacityHours,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const pendingTasks = totalTasks - completedTasks;

  // Effort calculations
  const totalTime = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const completedTime = tasks
    .filter((t) => t.isCompleted)
    .reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
  const pendingTime = Math.max(0, totalTime - completedTime);

  const roundedTotalTime = Math.round(totalTime * 10) / 10;
  const roundedCompletedTime = Math.round(completedTime * 10) / 10;
  const roundedPendingTime = Math.round(pendingTime * 10) / 10;

  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const timeProgressPct = totalTime > 0 ? Math.round((completedTime / totalTime) * 100) : 0;

  const effortValidation = validateEffortBudget(tasks, capacityHours);

  // Group tasks by day to show day-by-day mini-status
  const dayStatus: Array<{ day: number; total: number; completed: number; hours: number }> = [];
  for (let d = 1; d <= 7; d++) {
    const dayTasks = tasks.filter((t) => t.dayNumber === d);
    dayStatus.push({
      day: d,
      total: dayTasks.length,
      completed: dayTasks.filter((t) => t.isCompleted).length,
      hours: dayTasks.reduce((s, t) => s + (t.estimatedHours || 0), 0),
    });
  }

  return (
    <div className="bg-[#101014] border border-zinc-800 rounded-lg p-5 md:p-6 mb-6">
      {/* Top Meta Line: Editorial kicker & capacity tag */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-rose-600 rounded-full shadow-[0_0_8px_rgba(225,29,72,0.6)]" />
          <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">
            Sprint Execution Health & Velocity
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-zinc-400">Weekly Capacity:</span>
          <span
            className={`px-2 py-0.5 rounded-xs border text-[11px] font-semibold tabular-nums ${
              effortValidation.isValid
                ? 'bg-zinc-900 border-zinc-700/80 text-zinc-300'
                : 'bg-rose-950/80 border-rose-800 text-rose-300'
            }`}
          >
            {roundedTotalTime}h / {capacityHours}h ({effortValidation.isValid ? 'On Track' : `+${effortValidation.overflowHours}h Over`})
          </span>
        </div>
      </div>

      {/* Primary 3-Metric KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        {/* Metric 1: Completed Tasks */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Completed Tasks</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl md:text-3xl text-zinc-100 tabular-nums">
              {completedTasks}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              of {totalTasks} deliverables ({progressPct}%)
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            {completedTasks === totalTasks && totalTasks > 0
              ? 'All 7 sprint deliverables verified!'
              : `${pendingTasks} remaining to hit validation gate`}
          </p>
        </div>

        {/* Metric 2: Pending Tasks */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <Circle className="w-4 h-4 text-rose-400" />
            <span>Pending Tasks</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl md:text-3xl text-zinc-100 tabular-nums">
              {pendingTasks}
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              in sprint queue
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Estimated remaining effort: <strong className="text-zinc-200 font-mono tabular-nums">{roundedPendingTime}h</strong>
          </p>
        </div>

        {/* Metric 3: Estimated Total Sprint Time */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
            <Clock className="w-4 h-4 text-rose-500" />
            <span>Estimated Total Time</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-2xl md:text-3xl text-zinc-100 tabular-nums font-mono">
              {roundedTotalTime}h
            </span>
            <span className="text-xs text-zinc-500 font-mono">
              total sprint effort
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal font-mono tabular-nums">
            <span className="text-emerald-400">{roundedCompletedTime}h done</span>
            <span className="text-zinc-600 mx-1.5">·</span>
            <span className="text-rose-400">{roundedPendingTime}h pending</span>
          </p>
        </div>
      </div>

      {/* Visual Progress Bar Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400 flex items-center gap-1.5">
            <CalendarCheck2 className="w-3.5 h-3.5 text-rose-500" />
            <span>Sprint Progress (Deliverables & Time Burned)</span>
          </span>
          <span className="text-zinc-300 tabular-nums">
            {progressPct}% deliverables completed · {timeProgressPct}% hours logged
          </span>
        </div>

        {/* The Crimson Progress Track */}
        <div className="w-full h-2 bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gradient-to-r from-rose-700 via-rose-600 to-rose-500 transition-all duration-300 shadow-[0_0_12px_rgba(225,29,72,0.4)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* 7-Day Micro Indicators Strip */}
        <div className="grid grid-cols-7 gap-1.5 pt-3">
          {dayStatus.map((d) => {
            const isFinished = d.total > 0 && d.completed === d.total;
            const hasStarted = d.completed > 0 && d.completed < d.total;
            return (
              <div
                key={d.day}
                className={`p-1.5 rounded-sm border text-center transition-colors ${
                  isFinished
                    ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                    : hasStarted
                    ? 'bg-zinc-900 border-rose-900/60 text-zinc-200'
                    : d.total > 0
                    ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                }`}
              >
                <div className="text-[10px] font-mono font-semibold">D{d.day}</div>
                <div className="text-[9px] font-mono text-zinc-400 tabular-nums">
                  {d.completed}/{d.total}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
