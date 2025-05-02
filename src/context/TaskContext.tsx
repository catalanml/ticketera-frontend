// src/context/TaskContext.tsx
import React, { createContext, useState, ReactNode, useCallback } from 'react';

// Export the value type for the hook
export interface TaskContextValue {
    refreshKey: number; // A simple counter to trigger refreshes
    triggerRefresh: () => void; // Function to increment the counter
}

// Export the context itself for the hook
export const TaskContext = createContext<TaskContextValue | null>(null);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshKey(prevKey => prevKey + 1);
        console.log('TaskContext: Triggering refresh...'); // Optional: for debugging
    }, []);

    return (
        <TaskContext.Provider value={{ refreshKey, triggerRefresh }}>
            {children}
        </TaskContext.Provider>
    );
};

// Removed useTaskContext export from here
