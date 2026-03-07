import React from 'react';
import { SkeletonBox } from './SkeletonBase';

const AdminSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Page title + action */}
    <div className="flex items-center justify-between">
      <SkeletonBox className="h-8 w-48" />
      <SkeletonBox className="h-10 w-32 rounded-lg" />
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-stone-100 p-4 space-y-2">
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-7 w-14" />
        </div>
      ))}
    </div>

    {/* Table */}
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      {/* Table header */}
      <div className="flex gap-4 px-6 py-3 bg-stone-50 border-b border-stone-100">
        {['w-36', 'w-24', 'w-20', 'w-20', 'w-16'].map((w, i) => (
          <div key={i} className={`bg-stone-200 animate-pulse rounded-full h-4 ${w}`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-6 py-4 border-b border-stone-100 last:border-0 items-center">
          <SkeletonBox className="h-4 w-36" />
          <SkeletonBox className="h-4 w-28" />
          <SkeletonBox className="h-4 w-20" />
          <SkeletonBox className="h-6 w-20 rounded-full" />
          <SkeletonBox className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  </div>
);

export default AdminSkeleton;
