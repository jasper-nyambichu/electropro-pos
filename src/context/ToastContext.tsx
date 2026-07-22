'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (options: Omit<Toast, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<Toast, 'id'>) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const success = useCallback(
    (title: string, message?: string) => toast({ type: 'success', title, message }),
    [toast]
  );
  const error = useCallback(
    (title: string, message?: string) => toast({ type: 'error', title, message, duration: 6000 }),
    [toast]
  );
  const warning = useCallback(
    (title: string, message?: string) => toast({ type: 'warning', title, message }),
    [toast]
  );
  const info = useCallback(
    (title: string, message?: string) => toast({ type: 'info', title, message }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// ─── Toast Container ──────────────────────────────────────────────────────────

const ICONS: Record<ToastType, string> = {
  success: 'check_circle',
  error: 'error',
  warning: 'warning',
  info: 'info',
};

const COLORS: Record<ToastType, { bar: string; icon: string; bg: string; border: string }> = {
  success: {
    bar: 'bg-green-500',
    icon: 'text-green-600',
    bg: 'bg-white',
    border: 'border-green-200',
  },
  error: {
    bar: 'bg-red-500',
    icon: 'text-red-600',
    bg: 'bg-white',
    border: 'border-red-200',
  },
  warning: {
    bar: 'bg-yellow-400',
    icon: 'text-yellow-500',
    bg: 'bg-white',
    border: 'border-yellow-200',
  },
  info: {
    bar: 'bg-blue-500',
    icon: 'text-blue-600',
    bg: 'bg-white',
    border: 'border-blue-200',
  },
};

function ToastContainer({
  toasts,
  dismiss,
}: {
  toasts: Toast[];
  dismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-[58px] right-4 z-[9999] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)]"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        const c = COLORS[t.type];
        return (
          <div
            key={t.id}
            className={`relative flex items-start gap-3 rounded-lg border shadow-lg p-4 pr-8 ${c.bg} ${c.border} animate-in slide-in-from-right-4 fade-in duration-300`}
            role="alert"
          >
            {/* Left colour bar */}
            <div className={`absolute left-0 top-0 h-full w-1 rounded-l-lg ${c.bar}`} />

            {/* Icon */}
            <span className={`material-symbols-outlined text-[22px] shrink-0 ${c.icon}`}>
              {ICONS[t.type]}
            </span>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[13px] text-gray-900 leading-tight">{t.title}</p>
              {t.message && (
                <p className="text-[12px] text-gray-500 mt-0.5 leading-snug">{t.message}</p>
              )}
            </div>

            {/* Dismiss */}
            <button
              onClick={() => dismiss(t.id)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}