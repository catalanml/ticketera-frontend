// File: /home/lcatalan/projects/ticketera-frontend/src/components/TaskCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ITask, TaskStatusEnum } from '../types';
import invariant from 'tiny-invariant';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
    draggable,
    dropTargetForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';
import { pointerOutsideOfPreview } from '@atlaskit/pragmatic-drag-and-drop/element/pointer-outside-of-preview';
import { type Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { attachClosestEdge, extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { useBoardContext } from '../context/BoardContext';

interface TaskCardProps {
    task: ITask;
}

enum DropIndicator {
    None,
    Top,
    Bottom,
}

// --- Styling Helper Functions (Updated) ---

const getPriorityClasses = (priority?: ITask['priority']): string => {
    let classes = 'border-l-4 '; // Base thickness
    switch (priority) {
        // Removed Spanish cases to match ITask['priority'] type
        case 'Low':
            classes += 'border-l-green-500 dark:border-l-white/20';
            break;
        case 'Medium':
            classes += 'border-l-yellow-500 dark:border-l-white/50';
            break;
        case 'High':
            // Removed dark: prefix from animate-subtle-pulse
            classes += 'border-l-red-500 dark:border-l-white/90 animate-subtle-pulse';
            break;
        default:
            classes += 'border-l-stone-500 dark:border-l-stone-400'; // Default color
    }
    return classes;
};

const getStatusBadgeColor = (status: ITask['status']) => {
    // Map TaskStatusEnum values if necessary, or handle strings directly
    const statusString = typeof status === 'string' ? status.toLowerCase() : status;
    switch (statusString) {
        case TaskStatusEnum.ToDo.toLowerCase():
            // Removed Spanish case 'pendiente'
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300';
        case TaskStatusEnum.InProgress.toLowerCase():
            // Removed Spanish case 'en progreso'
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case TaskStatusEnum.Done.toLowerCase():
            // Removed Spanish case 'completada'
            return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        default:
            return 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-300';
    }
};

// --- TaskCard Component ---

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState<boolean>(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

    // Call the hook unconditionally. It returns null if not in a provider.
    const boardContext = useBoardContext();

    // Determine if DnD is enabled based on whether context is null
    const isDraggable = boardContext !== null;

    // Safely access context values using optional chaining
    const registerCard = boardContext?.registerCard;
    const instanceId = boardContext?.instanceId;

    // --- Drag and Drop Effect (Conditional) ---
    useEffect(() => {
        // Only run the effect if DnD is enabled (context exists)
        if (!isDraggable || !registerCard || !instanceId) {
            return; // Do nothing if not draggable
        }

        const element = ref.current;
        // Invariant check remains useful here to ensure the ref is connected
        invariant(element, 'TaskCard ref is not assigned');

        const dragData = {
            taskId: task._id,
            columnId: task.status,
            instanceId,
            type: 'card',
        };

        // Combine DnD functionalities
        return combine(
            registerCard(task._id, { element }),
            draggable({
                element: element,
                getInitialData: () => dragData,
                onGenerateDragPreview({ nativeSetDragImage }) {
                    setCustomNativeDragPreview({
                        nativeSetDragImage,
                        getOffset: pointerOutsideOfPreview({ x: '8px', y: '8px' }),
                        render({ container }) {
                            const preview = element.cloneNode(true) as HTMLElement;
                            preview.style.opacity = '0.8';
                            preview.classList.remove('-top-2', '-bottom-2');
                            container.appendChild(preview);
                            return () => preview.remove();
                        },
                    });
                },
                onDragStart: () => setDragging(true),
                onDrop: () => setDragging(false),
            }),
            dropTargetForElements({
                element: element,
                canDrop: (args) => args.source.data.type === 'card' && args.source.data.instanceId === instanceId,
                getIsSticky: () => true,
                getData: ({ input, element }) => {
                    const data = { ...dragData };
                    return attachClosestEdge(data, {
                        input,
                        element,
                        allowedEdges: ['top', 'bottom'],
                    });
                },
                onDragEnter: (args) => {
                    if (args.source.data.taskId !== task._id) {
                        setClosestEdge(extractClosestEdge(args.self.data));
                    }
                },
                onDrag: (args) => {
                    if (args.source.data.taskId !== task._id) {
                        setClosestEdge(extractClosestEdge(args.self.data));
                    }
                },
                onDragLeave: () => {
                    setClosestEdge(null);
                },
                onDrop: () => {
                    setClosestEdge(null);
                },
            }),
        );
        // Dependencies: run effect if task, context, or draggable status changes
    }, [task._id, task.status, registerCard, instanceId, isDraggable]);

    // --- Drop Indicator Logic (Conditional) ---
    const dropIndicator = isDraggable && closestEdge
        ? closestEdge === 'top'
            ? DropIndicator.Top
            : DropIndicator.Bottom
        : DropIndicator.None;

    // --- Class Calculation ---
    const priorityClasses = getPriorityClasses(task.priority);
    const baseClasses = `
        block relative rounded-xl bg-white dark:bg-black p-4
        shadow-md ${isDraggable ? 'hover:shadow-lg' : ''} transition-shadow duration-200
        border border-stone-200/80 dark:border-white/10
        ${isDraggable ? 'cursor-grab' : 'cursor-auto'} // Add grab cursor only if draggable
    `;
    const draggingClasses = isDraggable && dragging ? 'opacity-40' : 'opacity-100';
    const combinedClasses = `${baseClasses} ${priorityClasses} ${draggingClasses}`;

    // Indicator styles
    const indicatorBaseClasses = "absolute left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded z-10";
    const topIndicatorClasses = `${indicatorBaseClasses} -top-2`;
    const bottomIndicatorClasses = `${indicatorBaseClasses} -bottom-2`;

    // Capitalize status for display
    const displayStatus = typeof task.status === 'string'
        ? task.status.charAt(0).toUpperCase() + task.status.slice(1)
        : task.status;

    return (
        <div
            ref={ref}
            className={combinedClasses}
            aria-label={`Task: ${task.title}`}
            // Add draggable attribute conditionally
            draggable={isDraggable}
        >
            {/* Render drop indicators only if draggable */}
            {isDraggable && dropIndicator === DropIndicator.Top && <div className={topIndicatorClasses}></div>}
            {isDraggable && dropIndicator === DropIndicator.Bottom && <div className={bottomIndicatorClasses}></div>}

            {/* Task Content (remains the same) */}
            <div className="flex justify-between items-start mb-2">
                <h4 className="text-base font-semibold text-stone-900 dark:text-white pr-2">
                    {task.title}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(task.status)}`}>
                    {displayStatus}
                </span>
            </div>
            {task.description && (
                <p className="text-sm text-stone-500 dark:text-white/60 line-clamp-2">
                    {task.description}
                </p>
            )}
        </div>
    );
};

export default TaskCard;