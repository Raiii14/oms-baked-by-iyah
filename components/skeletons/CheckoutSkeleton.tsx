import React from 'react';
import { SkeletonBox, SkeletonText } from './SkeletonBase';

const CheckoutSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-6">
    <SkeletonBox className="h-8 w-36" />

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Delivery / contact form */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-5">
        <SkeletonBox className="h-6 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBox className="h-4 w-28" />
            <SkeletonBox className="h-10 w-full rounded-lg" />
          </div>
        ))}
        <div className="space-y-2">
          <SkeletonBox className="h-4 w-28" />
          <SkeletonBox className="h-20 w-full rounded-lg" />
        </div>
      </div>

      {/* Order summary */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 space-y-4">
          <SkeletonBox className="h-6 w-36" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <div className="flex gap-3 items-center">
                <SkeletonBox className="h-14 w-14 rounded-lg flex-shrink-0" />
                <SkeletonText lines={2} className="w-32" />
              </div>
              <SkeletonBox className="h-5 w-14" />
            </div>
          ))}
          <div className="border-t border-stone-100 pt-4 space-y-2">
            <div className="flex justify-between">
              <SkeletonBox className="h-5 w-20" />
              <SkeletonBox className="h-5 w-20" />
            </div>
            <div className="flex justify-between">
              <SkeletonBox className="h-6 w-16" />
              <SkeletonBox className="h-6 w-24" />
            </div>
          </div>
        </div>
        <SkeletonBox className="h-11 w-full rounded-full" />
      </div>
    </div>
  </div>
);

export default CheckoutSkeleton;
