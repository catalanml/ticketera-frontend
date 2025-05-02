import React, { useState, useEffect } from 'react';
import TaskCard from '../components/TaskCard';
import TaskCardSkeleton from '../components/TaskCardSkeleton';
import { ITask, TaskStatusEnum } from '../types';
import { fetchTasks } from '../services/task/taskService';
import { AxiosError } from 'axios';
import { useTaskContext } from '../hooks/useTaskContext'; // Corrected import path

const Dashboard: React.FC = () => {
    const [tasks, setTasks] = useState<ITask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { refreshKey } = useTaskContext(); // Get the refreshKey from context

    useEffect(() => {
        console.log('Dashboard: Fetching tasks due to mount or refreshKey change...'); // Optional: for debugging
        setIsLoading(true);
        setError(null);
        fetchTasks()
            .then((data) => {
                setTasks(data);
            })
            .catch(err => {
                console.error("Error fetching tasks:", err);
                let message = "Failed to load tasks. Please try again.";
                if (err instanceof AxiosError) {
                    if (err.response?.status === 401) {
                        message = "Authentication error. Please log in again.";
                    } else if (err.response?.data?.message) {
                        // Ensure message is a string
                        message = typeof err.response.data.message === 'string'
                            ? err.response.data.message
                            : JSON.stringify(err.response.data.message);
                    }
                } else if (err instanceof Error) {
                    message = err.message;
                }
                setError(message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [refreshKey]); // Add refreshKey to the dependency array

    const completedTasks = tasks.filter(task => task.status === TaskStatusEnum.Done).length;
    const inProgressTasks = tasks.filter(task => task.status === TaskStatusEnum.InProgress).length;
    const pendingTasks = tasks.filter(task => task.status === TaskStatusEnum.ToDo).length;

    return (
        <div>
            <h1 className="text-2xl font-semibold text-stone-900 dark:text-white mb-6">
                Dashboard
            </h1>

            {/* Display Error Message */}
            {error && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300" role="alert">
                    {error}
                </div>
            )}

            {/* Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {isLoading ? (
                    <>
                        <SummaryCardSkeleton />
                        <SummaryCardSkeleton />
                        <SummaryCardSkeleton />
                    </>
                ) : (
                    <>
                        <SummaryCard title="Tareas Pendientes" value={pendingTasks} />
                        <SummaryCard title="Tareas En Progreso" value={inProgressTasks} />
                        <SummaryCard title="Tareas Completadas" value={completedTasks} />
                    </>
                )}
            </div>

            {/* Task List Section */}
            <h2 className="text-xl font-semibold text-stone-900 dark:text-white mb-4">
                Mis Tareas Recientes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading
                    ? Array.from({ length: 6 }).map((_, index) => (
                        <TaskCardSkeleton key={index} />
                    ))
                    : tasks.map((task) => (
                        <TaskCard key={task._id} task={task} />
                    ))}
                {!isLoading && !error && tasks.length === 0 && (
                    <p className="text-stone-500 dark:text-white/60 col-span-full text-center py-8">No hay tareas para mostrar.</p>
                )}
            </div>
        </div>
    );
};

// --- Helper Components for Dashboard ---

// Summary Card
interface SummaryCardProps {
    title: string;
    value: number | string;
}
const SummaryCard: React.FC<SummaryCardProps> = ({ title, value }) => (
    <div className="rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-black p-4 shadow-sm">
        <p className="text-sm text-stone-500 dark:text-white/60 mb-1">{title}</p>
        <p className="text-2xl font-semibold text-stone-900 dark:text-white">{value}</p>
    </div>
);

// Summary Card Skeleton
const SummaryCardSkeleton: React.FC = () => (
    <div className="rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-black p-4 shadow-sm animate-pulse">
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-2"></div>
        <div className="h-7 bg-stone-200 dark:bg-stone-700 rounded w-1/2"></div>
    </div>
);


export default Dashboard;