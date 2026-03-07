import React from 'react';
import { SkeletonBox, SkeletonText } from './SkeletonBase';

const HomeSkeleton: React.FC = () => (
  <div className="space-y-12">
    {/* Hero */}
    <SkeletonBox className="rounded-3xl h-72 w-full" />

    {/* Custom Cake section */}
    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1 space-y-4">
        <SkeletonBox className="h-8 w-3/4" />
        <SkeletonText lines={3} />
        <SkeletonBox className="h-10 w-40 rounded-full" />
      </div>
      <SkeletonBox className="flex-1 h-64 rounded-xl" />
    </div>

    {/* Best Sellers */}
    <div className="space-y-4">
      <SkeletonBox className="h-7 w-48" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden shadow-sm space-y-0">
            <SkeletonBox className="h-64 rounded-b-none" />
            <div className="p-6 space-y-3 bg-white rounded-b-2xl border border-stone-100">
              <SkeletonBox className="h-5 w-3/4" />
              <SkeletonText lines={2} />
              <SkeletonBox className="h-5 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Why Choose Us */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3 p-6 bg-white rounded-2xl border border-stone-100">
          <SkeletonBox className="h-12 w-12 rounded-full" />
          <SkeletonBox className="h-5 w-2/3" />
          <SkeletonText lines={2} />
        </div>
      ))}
    </div>
  </div>
);

export default HomeSkeleton;
