import React, { useState, useEffect } from 'react';
import { SprintTask } from '../types';
import { X, Clock, Package, CheckSquare, Square } from 'lucide-react';

interface EditTaskModalProps {
  isOpen: boolean;
  task: SprintTask | null;
  onClose: () => void;
  onSave: (taskId: string, patch: Partial<SprintTask>) => void;
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({
  isOpen,
  task,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dayNumber, setDayNumber] = useState(1);
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [actualHoursSpent, setActualHoursSpent] = useState<string>('');
  const [deliverable, setDeliverable] = useState('');
  const [notes, setNotes] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setDayNumber(task.dayNumber);
      setEstimatedHours(task.estimatedHours);
      setActualHoursSpent(task.actualHoursSpent !== undefined ? String(task.actualHoursSpent) : '');
      setDeliverable(task.deliverable);
      setNotes(task.notes || '');
      setIsCompleted(task.isCompleted);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(task.id, {
      title: title.trim(),
      description: description.trim(),
      dayNumber: Number(dayNumber),
      estimatedHours: Math.max(0.5, Number(estimatedHours)),
      actualHoursSpent: actualHoursSpent !== '' ? Math.max(0, Number(actualHoursSpent)) : undefined,
      deliverable: deliverable.trim(),
      notes: notes.trim() || undefined,
      isCompleted,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#121215] border border-zinc-800 rounded-xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-rose-600 rounded-xs" />
            <h3 className="font-display font-semibold text-base text-zinc-100">
              Edit Sprint Task
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-zinc-200"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Task Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-zinc-300 font-medium mb-1">Sprint Day</label>
              <select
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-hidden focus:border-rose-500 font-mono"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                  <option key={d} value={d}>
                    Day 0{d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Est. Hours</label>
              <input
                type="number"
                step={0.5}
                min={0.5}
                max={20}
                required
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-hidden focus:border-rose-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-medium mb-1">Actual Hours Logged</label>
              <input
                type="number"
                step={0.25}
                min={0}
                max={50}
                placeholder="e.g. 1.75"
                value={actualHoursSpent}
                onChange={(e) => setActualHoursSpent(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 placeholder:text-zinc-600 focus:outline-hidden focus:border-rose-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">
              Description / Specific Action
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-hidden focus:border-rose-500 leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Deliverable Artifact</label>
            <input
              type="text"
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
              placeholder="e.g. Working payment link tested on 2 devices"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Founder Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Prospect requested invoice PDF auto-generation"
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-zinc-100 focus:outline-hidden focus:border-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsCompleted(!isCompleted)}
              className="flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer"
            >
              {isCompleted ? (
                <CheckSquare className="w-4 h-4 text-rose-500" />
              ) : (
                <Square className="w-4 h-4 text-zinc-500" />
              )}
              <span>Mark this deliverable as completed</span>
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
