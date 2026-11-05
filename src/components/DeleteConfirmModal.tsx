import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  projectTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  projectTitle,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#121215] border border-rose-900/50 rounded-xl shadow-2xl p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-md bg-rose-950/60 border border-rose-800/80 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5 text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-base text-zinc-100">
              Delete Validation Sprint?
            </h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Are you sure you want to delete <strong className="text-zinc-200">"{projectTitle}"</strong>? All associated 7-day sprint tasks, evidence logs, and strategy analyses will be permanently removed from your local storage.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-md transition-colors shadow-xs shadow-rose-950 cursor-pointer"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
