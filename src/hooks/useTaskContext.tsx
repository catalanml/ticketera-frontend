// src/hooks/useTaskContext.tsx
import { useContext } from 'react';
import { TaskContext, TaskContextValue } from '../context/TaskContext'; // Import context and value type

export const useTaskContext = (): TaskContextValue => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
};
