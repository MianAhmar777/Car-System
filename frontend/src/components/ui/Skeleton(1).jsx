import React from 'react';

export default function Skeleton({ className = '' }) {
  return (
    <div className={`bg-slate-200 animate-pulse rounded-xl ${className}`} />
  );
}

export function CarSkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden p-4 space-y-4 shadow-sm">
      <Skeleton className="h-48 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}
