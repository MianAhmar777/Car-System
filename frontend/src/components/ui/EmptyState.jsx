import React from 'react';
import { Car, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

export default function EmptyState({
  icon: Icon = Car,
  title = 'No Data Available',
  description = 'There are no items to display right now.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm max-w-lg mx-auto ${className}`}>
      <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-sky-600/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
