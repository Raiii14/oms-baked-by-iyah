import React from 'react';

interface SkeletonBoxProps {
  className?: string;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({ className = '' }) => (
  <div className={`bg-stone-200 animate-pulse rounded-xl ${className}`} />
);

interface SkeletonTextProps {
  className?: string;
  lines?: number;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({ className = '', lines = 1 }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`bg-stone-200 animate-pulse rounded-full h-4 ${i === lines - 1 && lines > 1 ? 'w-2/3' : 'w-full'}`}
      />
    ))}
  </div>
);
