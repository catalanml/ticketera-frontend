// File: /home/lcatalan/projects/ticketera-frontend/src/components/TaskCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ITask } from '../types';
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

// Import BoardContext hook
import { useBoardContext } from '../context/BoardContext';

interface TaskCardProps {
    task: ITask;
    // isDragging prop is no longer needed from parent, manage internally or via monitor
    // Add other props like onEdit, onDelete if needed
}

// Enum for drop indicator states
enum DropIndicator {
    None,
    Top,
    Bottom,
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const { registerCard, instanceId } = useBoardContext(); // Get context values
    const ref = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState<boolean>(false);
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);

    useEffect(() => {
        const element = ref.current;
        invariant(element);

        const dragData = {
            taskId: task._id,
            columnId: task.status, // Assuming task.status holds the column/status ID
            instanceId,
            type: 'card',
        };

        return combine(
            registerCard(task._id, { element }), // Register with registry
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
                    const data = { ...dragData }; // Include card data for context
                    return attachClosestEdge(data, {
                        input,
                        element,
                        allowedEdges: ['top', 'bottom'],
                    });
                },
                onDragEnter: (args) => {
                    // Highlight edge only if dragging a different card
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
    }, [task._id, task.status, registerCard, instanceId]); // Dependencies for the effect

    // Determine drop indicator state based on closestEdge
    const dropIndicator = closestEdge
        ? closestEdge === 'top'
            ? DropIndicator.Top
            : DropIndicator.Bottom
        : DropIndicator.None;

    // Base classes
    const baseClasses = "block p-4 bg-white dark:bg-black rounded-lg shadow hover:shadow-md transition-shadow border border-stone-200 dark:border-stone-700 relative"; // Added relative positioning
    // Combine with dragging styles
    const combinedClasses = `${baseClasses} ${dragging ? 'opacity-40' : 'opacity-100'}`;

    // Indicator styles
    const indicatorBaseClasses = "absolute left-0 right-0 h-1 bg-blue-600 dark:bg-blue-400 rounded";
    const topIndicatorClasses = `${indicatorBaseClasses} -top-2`; // Position above
    const bottomIndicatorClasses = `${indicatorBaseClasses} -bottom-2`; // Position below

    return (
        <div
            ref={ref}
            className={combinedClasses}
            aria-label={`Task: ${task.title}`}
        // No dnd-kit props needed anymore
        >
            {/* Render drop indicators */}
            {dropIndicator === DropIndicator.Top && <div className={topIndicatorClasses}></div>}
            {dropIndicator === DropIndicator.Bottom && <div className={bottomIndicatorClasses}></div>}

            <h3 className="font-medium text-stone-800 dark:text-stone-100 mb-1">{task.title}</h3>
            {task.description && (
                <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">{task.description}</p>
            )}
            {/* Add more details like priority, assignee, etc. later */}
        </div>
    );
};

export default TaskCard;