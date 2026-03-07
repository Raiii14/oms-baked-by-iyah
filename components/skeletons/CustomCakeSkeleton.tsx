import React from 'react';
import { SkeletonBox, SkeletonText } from './SkeletonBase';

const CustomCakeSkeleton: React.FC = () => (
  <div className="max-w-2xl mx-auto space-y-8">
    {/* Page title */}
    <div className="space-y-2">
      <SkeletonBox className="h-8 w-56" />
      <SkeletonText lines={2} />
    </div>

    {/* Form fields */}
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6 border border-stone-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBox className="h-4 w-24" />
          <SkeletonBox className="h-10 w-full rounded-lg" />
        </div>
      ))}

      {/* Textarea */}
      <div className="space-y-2">
        <SkeletonBox className="h-4 w-24" />
        <SkeletonBox className="h-24 w-full rounded-lg" />
      </div>

      {/* Submit button */}
      <SkeletonBox className="h-11 w-full rounded-full" />
    </div>
  </div>
);

export default CustomCakeSkeleton;
