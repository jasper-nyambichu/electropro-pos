interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 bg-surface-container rounded-full flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-on-surface-variant/40 text-5xl">{icon}</span>
      </div>
      <h3 className="text-base font-semibold text-on-surface mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-on-surface-variant max-w-sm leading-relaxed">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 bg-primary text-on-primary px-5 py-2.5 rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          {actionLabel}
        </button>
      )}
    </div>
  );
}