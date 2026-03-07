import React from 'react';
import { SkeletonBox, SkeletonText } from './SkeletonBase';

const CartSkeleton: React.FC = () => (
  <div className="max-w-3xl mx-auto space-y-6">
    {/* Title */}
    <SkeletonBox className="h-8 w-24" />

    {/* Cart items */}
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 divide-y divide-stone-100">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <SkeletonBox className="h-20 w-20 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-5 w-1/2" />
            <SkeletonText lines={1} className="w-1/3" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-9 w-24 rounded-lg" />
            <SkeletonBox className="h-5 w-14" />
          </div>
        </div>
      ))}
    </div>

    {/* Summary */}
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
      <div className="flex justify-between">
        <SkeletonBox className="h-5 w-24" />
        <SkeletonBox className="h-5 w-20" />
      </div>
      <div className="flex justify-between">
        <SkeletonBox className="h-6 w-16" />
        <SkeletonBox className="h-6 w-24" />
      </div>
      <SkeletonBox className="h-11 w-full rounded-full" />
    </div>
  </div>
);

export default CartSkeleton;
