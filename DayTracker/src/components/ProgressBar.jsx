import { memo } from 'react';

function ProgressBar({ percent = 0, label = 'Progress', showLabel = true }) {
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <div className="w-full" role="group" aria-label={label}>
      {showLabel && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-600 dark:text-slate-300">{label}</span>
          <span className="font-semibold text-brand-600 dark:text-brand-400">{clamped}%</span>
        </div>
      )}
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-400 transition-all duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default memo(ProgressBar);
