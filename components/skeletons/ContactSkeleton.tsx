import React from 'react';
import { SkeletonBox } from './SkeletonBase';

const ContactSkeleton: React.FC = () => (
  <div className="max-w-3xl mx-auto space-y-10">
    <div className="text-center space-y-3">
      <SkeletonBox className="h-10 w-52 mx-auto" />
      <SkeletonBox className="h-4 w-80 mx-auto" />
    </div>
    <SkeletonBox className="h-48 rounded-2xl" />
    <SkeletonBox className="h-44 rounded-2xl" />
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonBox key={i} className="h-14 rounded-xl" />
      ))}
    </div>
  </div>
);

export default ContactSkeleton;
