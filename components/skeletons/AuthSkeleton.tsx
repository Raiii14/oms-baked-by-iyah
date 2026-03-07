import React from 'react';
import { SkeletonBox } from './SkeletonBase';

const AuthSkeleton: React.FC = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-stone-100">
    {/* Frosted card — mirrors the redesigned Auth page layout */}
    <div className="w-full max-w-md bg-white/80 rounded-3xl shadow-xl p-8 space-y-6 border border-stone-200 mx-4">
      {/* Logo / brand */}
      <div className="flex flex-col items-center space-y-3">
        <SkeletonBox className="h-16 w-16 rounded-2xl" />
        <SkeletonBox className="h-6 w-40" />
        <SkeletonBox className="h-4 w-32" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <SkeletonBox className="flex-1 h-10 rounded-full" />
        <SkeletonBox className="flex-1 h-10 rounded-full" />
      </div>

      {/* Input fields */}
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonBox key={i} className="h-12 w-full rounded-xl" />
        ))}
      </div>

      {/* Submit button */}
      <SkeletonBox className="h-12 w-full rounded-full" />

      {/* Footer link */}
      <SkeletonBox className="h-4 w-48 mx-auto" />
    </div>
  </div>
);

export default AuthSkeleton;
