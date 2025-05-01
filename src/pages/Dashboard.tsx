// src/pages/Dashboard.tsx (or components, depending on your structure)
import React, { useState, useEffect, useMemo } from 'react';
import TaskCard from '../components/TaskCard';
import TaskCardSkeleton from '../components/TaskCardSkeleton';
import {
    BoardProvider,
    createRegistry,
    type BoardContextValue,
} from '../context/BoardContext'; // Import BoardProvider and related items
import { ITask } from '../types'; // Ensure ITask is imported if not already

// Define a type for your task data
interface Task {
    id: string;
    title: string;
    status: 'pendiente' | 'en progreso' | 'completada';
    priority: 'baja' | 'media' | 'alta';
    summary?: string; // Optional summary
}

// Mock data fetching function
const fetchTasks = (): Promise<Task[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: '1', title: 'Configurar entorno de desarrollo', status: 'completada', priority: 'alta', summary: 'Instalar Node, Git, Docker...' },
                { id: '2', title: 'Diseñar UI para Dashboard', status: 'en progreso', priority: 'media', summary: 'Crear componentes React con Tailwind.' },
                { id: '3', title: 'Implementar autenticación', status: 'pendiente', priority: 'alta' },
                { id: '4', title: 'Escribir pruebas unitarias', status: 'pendiente', priority: 'media', summary: 'Usar Jest y React Testing Library.' },
                { id: '5', title: 'Desplegar aplicación en Vercel', status: 'pendiente', priority: 'baja' },
            ]);
        }, 1500); // Simulate network delay
    });
};

const Dashboard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- Create Board Context Value ---
    // Create a registry instance
    const registry = useMemo(() => createRegistry(), []);
    // Create a stable instanceId
    const instanceId = useMemo(() => Symbol('dashboard-instance'), []);

    // Placeholder functions for board operations (not functional in this context)
    const reorderCard = () => { console.warn('reorderCard called in Dashboard - not implemented'); };
    const moveCard = () => { console.warn('moveCard called in Dashboard - not implemented'); };

    // Construct the context value
    const boardContextValue: BoardContextValue = useMemo(() => ({
        reorderCard,
        moveCard,
        registerCard: registry.cardRegistry.register,
        registerColumn: registry.columnRegistry.register,
        instanceId,
    }), [registry, instanceId]); // Dependencies for useMemo
    // --- End Board Context Value ---

    useEffect(() => {
        setIsLoading(true);
        fetchTasks()
            .then((data) => {
                setTasks(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Error fetching tasks:", error);
                setIsLoading(false); // Stop loading even if there's an error
            });
    }, []);

    const completedTasks = tasks.filter(task => task.status === 'completada').length;
    const inProgressTasks = tasks.filter(task => task.status === 'en progreso').length;
    const pendingTasks = tasks.filter(task => task.status === 'pendiente').length;

    return (
        // Provide the created context value to the provider
        <BoardProvider value={boardContextValue}>
            <div>
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-white mb-6">
                    Dashboard
                </h1>

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
                        : tasks.map((task) => {
                            // Adapt the mock Task to fit ITask expected by TaskCard
                            const taskData: ITask = {
                                _id: task.id,
                                title: task.title,
                                status: task.status, // Assuming status aligns with ColumnId type
                                priority: task.priority,
                                description: task.summary,
                                boardId: 'mock-dashboard-board', // Placeholder boardId
                                order: 0, // Placeholder order
                                // Add any other required fields from ITask with default/mock values
                            };
                            return <TaskCard key={task.id} task={taskData} />;
                        })}
                    {!isLoading && tasks.length === 0 && (
                        <p className="text-stone-500 dark:text-white/60 col-span-full text-center py-8">No hay tareas para mostrar.</p>
                    )}
                </div>
            </div>
        </BoardProvider>
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