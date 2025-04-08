// src/components/TaskCard.tsx
import React from 'react';

interface Task {
    id: string;
    title: string;
    status: 'pendiente' | 'en progreso' | 'completada';
    priority: 'baja' | 'media' | 'alta';
    summary?: string;
}

interface TaskCardProps {
    task: Task;
}

// Función para obtener las clases CSS basadas en la prioridad
// Devuelve un string con las clases para el borde izquierdo y la animación si aplica
const getPriorityClasses = (priority: Task['priority']): string => {
    let classes = '';
    switch (priority) {
        case 'baja':
            // Modo claro: Verde | Modo oscuro: Blanco muy sutil
            classes = 'border-l-green-500 dark:border-l-white/20';
            break;
        case 'media':
            // Modo claro: Amarillo | Modo oscuro: Blanco más notable
            classes = 'border-l-yellow-500 dark:border-l-white/50';
            break;
        case 'alta':
            // Modo claro: Rojo | Modo oscuro: Blanco más opaco + Animación
            classes = 'border-l-red-500 dark:border-l-white/90 animate-subtle-pulse'; // Añade la clase de animación aquí
            break;
        default:
            // Default: Stone
            classes = 'border-l-stone-500 dark:border-l-stone-400';
    }
    return classes;
};

// Función para obtener el color del badge de estado (igual que antes)
const getStatusBadgeColor = (status: Task['status']) => {
    switch (status) {
        case 'pendiente': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
        case 'en progreso': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'completada': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        default: return 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300';
    }
};


const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const priorityClasses = getPriorityClasses(task.priority);

    return (
        // Aplicamos las clases:
        // - Borde general sutil: border border-stone-200/80 dark:border-white/10
        // - Grosor borde izquierdo: border-l-4
        // - Color borde izquierdo y animación condicional: priorityClasses
        <div
            className={`
            rounded-xl
            bg-white dark:bg-black
            p-4
            shadow-md hover:shadow-lg
            transition-shadow duration-200
            border border-stone-200/80 dark:border-white/10  /* Borde general SUTIL */
            border-l-4                                      /* Grosor borde izquierdo FIJO */
            ${priorityClasses}                              /* Color borde izquierdo + Animación (si aplica) */
        `}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-base font-semibold text-stone-900 dark:text-white pr-2">
                    {task.title}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(task.status)}`}>
                    {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
            </div>
            {task.summary && (
                <p className="text-sm text-stone-500 dark:text-white/60">
                    {task.summary}
                </p>
            )}
        </div>
    );
};

export default TaskCard;