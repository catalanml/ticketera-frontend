// File: /home/lcatalan/projects/ticketera-frontend/src/components/Column.tsx
import React, { useEffect, useRef, useState } from 'react';
import { ITask, IStatus } from '../types';
import TaskCard from './TaskCard';
import invariant from 'tiny-invariant';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { useBoardContext } from '../context/BoardContext'; // Import context hook

interface BoardColumn extends IStatus {
    tasks: ITask[];
}

interface ColumnProps {
    column: BoardColumn;
    // tasks prop is no longer needed separately, get from column
}

const Column: React.FC<ColumnProps> = ({ column }) => {
    const { registerColumn, instanceId } = useBoardContext(); // Get context values
    const ref = useRef<HTMLDivElement | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

    useEffect(() => {
        const element = ref.current;
        invariant(element);

        return combine(
            registerColumn(column._id, { element }), // Register column with registry
            dropTargetForElements({
                element: element,
                getData: () => ({ columnId: column._id, instanceId, type: 'column' }),
                canDrop: (args) => args.source.data.type === 'card' && args.source.data.instanceId === instanceId,
                getIsSticky: () => true,
                onDragEnter: () => setIsDraggingOver(true),
                onDragLeave: () => setIsDraggingOver(false),
                onDrop: () => setIsDraggingOver(false),
            }),
        );
    }, [column._id, registerColumn, instanceId]);

    const style = {
        // Add visual indication when dragging over
        backgroundColor: isDraggingOver ? 'rgba(0, 0, 0, 0.05)' : undefined,
        minHeight: '100px', // Ensure column has height even when empty
    };

    return (
        <div
            ref={ref}
            style={style}
            className="flex-shrink-0 w-72 bg-stone-100 dark:bg-stone-800 rounded-lg p-3 shadow"
        >
            <h2 className="text-lg font-medium mb-4 px-1 text-stone-700 dark:text-stone-300">{column.name}</h2>
            <div className="space-y-3">
                {/* No SortableContext needed here with pragmatic-dnd */}
                {column.tasks.map(task => (
                    <TaskCard key={task._id} task={task} />
                ))}
                {/* Add placeholder if column is empty and being dragged over */}
                {column.tasks.length === 0 && isDraggingOver && (
                    <div className="h-16 rounded-lg border-2 border-dashed border-stone-400 dark:border-stone-600 flex items-center justify-center text-stone-500 dark:text-stone-400">
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
};

export default Column;