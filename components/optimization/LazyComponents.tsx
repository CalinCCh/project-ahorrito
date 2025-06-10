'use client';

import { Suspense, lazy } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load heavy components
export const LazyDataGrid = lazy(() => 
  import('@/components/data-display/DataGrid').then(module => ({ default: module.DataGrid }))
);

export const LazyRecentActivity = lazy(() => 
  import('@/components/data-display/RecentActivity').then(module => ({ default: module.RecentActivity }))
);

export const LazyAccountFilter = lazy(() => 
  import('@/components/filters/AccountFilter').then(module => ({ default: module.AccountFilter }))
);

export const LazySavingsGoalsSection = lazy(() => 
  import('@/components/savings/SavingsGoalsSection').then(module => ({ default: module.SavingsGoalsSection }))
);

// Loading skeletons
export const DataGridSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
    <Skeleton className="h-8 w-full" />
  </div>
);

export const ActivitySkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

export const FilterSkeleton = () => (
  <Skeleton className="h-10 w-full max-w-xs" />
);

export const SavingsSkeleton = () => (
  <div className="grid gap-4 md:grid-cols-2">
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-32 w-full" />
  </div>
);

// Wrapper components with suspense
export const OptimizedDataGrid = (props: any) => (
  <Suspense fallback={<DataGridSkeleton />}>
    <LazyDataGrid {...props} />
  </Suspense>
);

export const OptimizedRecentActivity = (props: any) => (
  <Suspense fallback={<ActivitySkeleton />}>
    <LazyRecentActivity {...props} />
  </Suspense>
);

export const OptimizedAccountFilter = (props: any) => (
  <Suspense fallback={<FilterSkeleton />}>
    <LazyAccountFilter {...props} />
  </Suspense>
);

export const OptimizedSavingsGoalsSection = (props: any) => (
  <Suspense fallback={<SavingsSkeleton />}>
    <LazySavingsGoalsSection {...props} />
  </Suspense>
);
