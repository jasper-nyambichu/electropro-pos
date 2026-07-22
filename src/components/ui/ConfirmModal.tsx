'use client';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white w-full max-w-md rounded-lg shadow-2xl overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-error-container rounded-full flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-error text-2xl">warning</span>
            </div>
            <h3 className="text-lg font-bold text-on-background">{title}</h3>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">{message}</p>
        </div>

        <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant/30 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold bg-error text-on-error rounded-lg hover:brightness-90 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading && (
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}