// src/components/TaskCardSkeleton.tsx
import React from 'react';

const TaskCardSkeleton: React.FC = () => {
    return (
        <div className="rounded-xl border border-l-4 border-stone-300 dark:border-stone-700 bg-white dark:bg-black p-4 shadow-md animate-pulse border-stone-200 dark:border-white/10">
            <div className="flex justify-between items-start mb-2">
                <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-3/4"></div> {/* Title Skeleton */}
                <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded-full w-16"></div> {/* Badge Skeleton */}
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-full"></div> {/* Summary Line 1 */}
                <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-5/6"></div> {/* Summary Line 2 */}
            </div>
            {/* Optional: Skeleton for other details */}
            {/* <div className="mt-3 h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/4"></div> */}
        </div>
    );
};

export default TaskCardSkeleton;