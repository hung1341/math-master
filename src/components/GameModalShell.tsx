import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

interface GameModalShellProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  maxWidthClass?: string;
  children: ReactNode;
}

export function GameModalShell({
  title,
  subtitle,
  onClose,
  maxWidthClass = 'max-w-3xl',
  children,
}: GameModalShellProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-modal-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/65 p-4"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[88vh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6 dark:border-slate-800">
          <div>
            <h2
              id="game-modal-title"
              className="font-display text-xl font-extrabold text-slate-900 dark:text-white"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white shrink-0"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
