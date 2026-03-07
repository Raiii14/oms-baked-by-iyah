import React from 'react';
import { SkeletonBox, SkeletonText } from './SkeletonBase';

const MenuSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header + search */}
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <SkeletonBox className="h-8 w-32" />
      <SkeletonBox className="h-10 w-48 rounded-full" />
    </div>

    {/* Product grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden shadow-sm">
          <SkeletonBox className="h-48 rounded-b-none" />
          <div className="p-4 space-y-3 bg-white rounded-b-2xl border border-stone-100">
            <SkeletonBox className="h-5 w-3/4" />
            <SkeletonText lines={2} />
            <div className="flex items-center justify-between pt-1">
              <SkeletonBox className="h-5 w-16" />
              <SkeletonBox className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default MenuSkeleton;
