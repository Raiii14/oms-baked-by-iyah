import React from 'react';
import { SkeletonBox, SkeletonText } from './SkeletonBase';

const ProfileSkeleton: React.FC = () => (
  <div className="max-w-2xl mx-auto space-y-6">
    {/* Avatar + name */}
    <div className="flex items-center gap-5">
      <SkeletonBox className="h-20 w-20 rounded-full flex-shrink-0" />
      <div className="space-y-2 flex-1">
        <SkeletonBox className="h-6 w-40" />
        <SkeletonBox className="h-4 w-56" />
      </div>
    </div>

    {/* Info card */}
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-5">
      <SkeletonBox className="h-6 w-36" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-1">
          <SkeletonBox className="h-3 w-20" />
          <SkeletonBox className="h-5 w-full" />
        </div>
      ))}
    </div>

    {/* Order history */}
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
      <SkeletonBox className="h-6 w-36" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-3 border-b border-stone-100 last:border-0">
          <SkeletonText lines={2} className="w-1/2" />
          <SkeletonBox className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  </div>
);

export default ProfileSkeleton;
