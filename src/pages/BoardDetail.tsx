// File: /home/lcatalan/projects/ticketera-frontend/src/pages/BoardDetail.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { IBoard, ITask, IStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import Column from '../components/Column';
import { AxiosError } from 'axios';
import invariant from 'tiny-invariant';

// Pragmatic DND imports
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder } from '@atlaskit/pragmatic-drag-and-drop/reorder';

// Board Context and Registry
import { BoardProvider, createRegistry, BoardContextValue } from '../context/BoardContext';

// Define the structure for columns based on statuses
interface BoardColumn extends IStatus {
    tasks: ITask[];
}

// Type for the board state, similar to the example
type BoardState = {
    columnMap: { [key: string]: BoardColumn };
    orderedColumnIds: string[];
};

const BoardDetail: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { isAuthenticated } = useAuth();
    const [boardInfo, setBoardInfo] = useState<IBoard | null>(null); // Store board metadata separately
    const [boardState, setBoardState] = useState<BoardState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use useRef to keep a stable reference to the latest board state for the monitor
    const stableBoardState = useRef(boardState);
    useEffect(() => {
        stableBoardState.current = boardState;
    }, [boardState]);

    // Create registry instance
    const [registry] = useState(() => createRegistry());
    // Create a unique ID for this board instance
    const [instanceId] = useState(() => Symbol('board-instance'));

    const loadBoardDetails = useCallback(async () => {
        if (!isAuthenticated || !boardId) {
            setError("Authentication required or Board ID missing.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // --- Placeholder Data --- (Keep for now)
            // Corrected: Use createdBy instead of owner
            const placeholderBoard: IBoard = { _id: boardId!, name: 'Loading Board...', description: '', createdBy: 'placeholder-user-id', createdAt: '', updatedAt: '' };
            const placeholderStatuses: IStatus[] = [
                // Added missing properties based on IStatus type update
                { _id: 'todo', name: 'To Do', boardId: boardId!, order: 0 },
                { _id: 'inprogress', name: 'In Progress', boardId: boardId!, order: 1 },
                { _id: 'done', name: 'Done', boardId: boardId!, order: 2 },
            ];
            const placeholderTasks: ITask[] = [
                // Added missing properties based on ITask type update
                { _id: 'task-1', title: 'Task 1', description: 'Desc 1', status: 'todo', boardId: boardId!, order: 0 },
                { _id: 'task-2', title: 'Task 2', description: 'Desc 2', status: 'todo', boardId: boardId!, order: 1 },
                { _id: 'task-3', title: 'Task 3', description: 'Desc 3', status: 'inprogress', boardId: boardId!, order: 0 },
            ];
            setBoardInfo(placeholderBoard);
            // --- End Placeholder Data ---

            // Process data into the BoardState structure
            const columnsMap: { [key: string]: BoardColumn } = {};
            // Sort statuses by order (should now work)
            const orderedIds = placeholderStatuses
                .sort((a, b) => a.order - b.order)
                .map(status => {
                    columnsMap[status._id] = { ...status, tasks: [] };
                    return status._id;
                });

            placeholderTasks.forEach(task => {
                // Ensure task.status is a string key
                // Simplified: Assuming task.status will be the string ID here
                const statusKey = task.status as string;
                const column = columnsMap[statusKey];
                if (column) {
                    column.tasks.push(task);
                }
            });

            // Ensure tasks within columns are sorted by their order (should now work)
            Object.values(columnsMap).forEach(column => {
                column.tasks.sort((a, b) => a.order - b.order);
            });

            setBoardState({ columnMap: columnsMap, orderedColumnIds: orderedIds });

        } catch (err: unknown) {
            console.error("Error fetching board details:", err);
            let message = "Failed to load board details.";
            if (err instanceof AxiosError && err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [boardId, isAuthenticated]);

    useEffect(() => {
        loadBoardDetails();
    }, [loadBoardDetails]);

    // --- State Update Functions (Implement based on example) ---

    const reorderCard = useCallback(
        ({
            columnId,
            startIndex,
            finishIndex,
        }: {
            columnId: string;
            startIndex: number;
            finishIndex: number;
            trigger?: 'pointer' | 'keyboard';
        }) => {
            setBoardState((currentState) => {
                if (!currentState) return null;

                const sourceColumn = currentState.columnMap[columnId];
                if (!sourceColumn) return currentState; // Column not found

                const updatedItems = reorder({
                    list: sourceColumn.tasks,
                    startIndex,
                    finishIndex,
                });

                // Update order property for persistence
                const updatedTasksWithOrder = updatedItems.map((task, index) => ({
                    ...task,
                    order: index,
                }));

                const updatedSourceColumn: BoardColumn = {
                    ...sourceColumn,
                    tasks: updatedTasksWithOrder,
                };

                const updatedMap: { [key: string]: BoardColumn } = {
                    ...currentState.columnMap,
                    [columnId]: updatedSourceColumn,
                };

                // TODO: API Call to update task order for all affected tasks in this column
                console.log('Reordering in column:', columnId, updatedTasksWithOrder);

                // Flash effect on the moved card
                const finalItem = updatedTasksWithOrder[finishIndex];
                if (finalItem) {
                    const cardEntry = registry.cardRegistry.getCard(finalItem._id);
                    if (cardEntry) {
                        triggerPostMoveFlash(cardEntry.element);
                    }
                }

                return {
                    ...currentState,
                    columnMap: updatedMap,
                };
            });
        },
        [registry.cardRegistry], // Dependency on registry
    );

    const moveCard = useCallback(
        ({
            startColumnId,
            finishColumnId,
            itemIndexInStartColumn,
            itemIndexInFinishColumn,
        }: {
            startColumnId: string;
            finishColumnId: string;
            itemIndexInStartColumn: number;
            itemIndexInFinishColumn?: number;
            trigger?: 'pointer' | 'keyboard';
        }) => {
            // Invalid cross column movement (should be handled by drop logic, but double check)
            if (startColumnId === finishColumnId) {
                return;
            }
            setBoardState((currentState) => {
                if (!currentState) return null;

                const sourceColumn = currentState.columnMap[startColumnId];
                const destinationColumn = currentState.columnMap[finishColumnId];
                if (!sourceColumn || !destinationColumn) return currentState; // Columns not found

                const item: ITask | undefined = sourceColumn.tasks[itemIndexInStartColumn];
                if (!item) return currentState; // Item not found

                // Remove from source
                const newSourceTasks = sourceColumn.tasks.filter((i) => i._id !== item._id);
                const updatedSourceTasksWithOrder = newSourceTasks.map((task, index) => ({
                    ...task,
                    order: index,
                }));

                // Add to destination
                const destinationItems = Array.from(destinationColumn.tasks);
                const newIndexInDestination = itemIndexInFinishColumn ?? destinationItems.length; // Append if no index

                // Update status and insert
                const movedItem = { ...item, status: finishColumnId };
                destinationItems.splice(newIndexInDestination, 0, movedItem);
                const updatedDestinationTasksWithOrder = destinationItems.map((task, index) => ({
                    ...task,
                    order: index,
                }));

                const updatedMap = {
                    ...currentState.columnMap,
                    [startColumnId]: {
                        ...sourceColumn,
                        tasks: updatedSourceTasksWithOrder,
                    },
                    [finishColumnId]: {
                        ...destinationColumn,
                        tasks: updatedDestinationTasksWithOrder,
                    },
                };

                // TODO: API Call to update the task's status and order
                console.log(`Moving task ${item._id} to column ${finishColumnId} at index ${newIndexInDestination}`);
                console.log('New order in target column:', updatedDestinationTasksWithOrder);
                console.log('New order in source column:', updatedSourceTasksWithOrder);

                // Flash effect on the moved card
                const finalItem = updatedDestinationTasksWithOrder[newIndexInDestination];
                if (finalItem) {
                    // Need a slight delay for the flash to work after potential re-render
                    setTimeout(() => {
                        const cardEntry = registry.cardRegistry.getCard(finalItem._id);
                        if (cardEntry) {
                            triggerPostMoveFlash(cardEntry.element);
                        }
                    }, 0);
                }

                return {
                    ...currentState,
                    columnMap: updatedMap,
                };
            });
        },
        [registry.cardRegistry], // Dependency on registry
    );

    // --- Drag and Drop Monitor Effect ---
    useEffect(() => {
        // Ensure boardState is loaded before setting up monitor
        if (!boardState) {
            return;
        }

        return combine(
            monitorForElements({
                canMonitor({ source }) {
                    // Only monitor drags originating from this board instance
                    return source.data.instanceId === instanceId;
                },
                onDrop(args) {
                    const { location, source } = args;
                    const currentBoardState = stableBoardState.current; // Use the ref here

                    // Didn't drop on anything valid
                    if (!location.current.dropTargets.length || !currentBoardState) {
                        return;
                    }

                    // Dragging a card
                    if (source.data.type === 'card') {
                        const taskId = source.data.taskId;
                        invariant(typeof taskId === 'string');

                        const startColumnId = source.data.columnId;
                        invariant(typeof startColumnId === 'string');

                        const sourceColumn = currentBoardState.columnMap[startColumnId];
                        const itemIndex = sourceColumn.tasks.findIndex((task) => task._id === taskId);
                        if (itemIndex < 0) return; // Item not found in source column

                        // Dropping on a column (directly)
                        if (location.current.dropTargets.length === 1) {
                            const [destinationColumnRecord] = location.current.dropTargets;
                            const destinationColumnId = destinationColumnRecord.data.columnId;
                            invariant(typeof destinationColumnId === 'string');
                            const destinationColumn = currentBoardState.columnMap[destinationColumnId];
                            invariant(destinationColumn);

                            // Reordering in same column (dropped on column, goes to last position)
                            if (startColumnId === destinationColumnId) {
                                const destinationIndex = getReorderDestinationIndex({
                                    startIndex: itemIndex,
                                    indexOfTarget: sourceColumn.tasks.length - 1, // Target is the last item
                                    closestEdgeOfTarget: null, // Dropped on column, not edge
                                    axis: 'vertical',
                                });
                                reorderCard({
                                    columnId: startColumnId,
                                    startIndex: itemIndex,
                                    finishIndex: destinationIndex,
                                    trigger: 'pointer',
                                });
                                return;
                            }

                            // Moving card to a new column (dropped on column, goes to last position)
                            moveCard({
                                itemIndexInStartColumn: itemIndex,
                                startColumnId: startColumnId,
                                finishColumnId: destinationColumnId,
                                itemIndexInFinishColumn: destinationColumn.tasks.length, // Append to end
                                trigger: 'pointer',
                            });
                            return;
                        }

                        // Dropping on a card (relative position)
                        if (location.current.dropTargets.length === 2) {
                            const [destinationCardRecord, destinationColumnRecord] = location.current.dropTargets;
                            const destinationColumnId = destinationColumnRecord.data.columnId;
                            invariant(typeof destinationColumnId === 'string');
                            const destinationColumn = currentBoardState.columnMap[destinationColumnId];
                            invariant(destinationColumn);

                            const targetTaskId = destinationCardRecord.data.taskId;
                            invariant(typeof targetTaskId === 'string');

                            const indexOfTarget = destinationColumn.tasks.findIndex(
                                (task) => task._id === targetTaskId,
                            );
                            if (indexOfTarget < 0) return; // Target card not found

                            const closestEdgeOfTarget: Edge | null = extractClosestEdge(
                                destinationCardRecord.data,
                            );

                            // Case 1: Reordering in the same column
                            if (startColumnId === destinationColumnId) {
                                const destinationIndex = getReorderDestinationIndex({
                                    startIndex: itemIndex,
                                    indexOfTarget,
                                    closestEdgeOfTarget,
                                    axis: 'vertical',
                                });
                                reorderCard({
                                    columnId: startColumnId,
                                    startIndex: itemIndex,
                                    finishIndex: destinationIndex,
                                    trigger: 'pointer',
                                });
                                return;
                            }

                            // Case 2: Moving into a new column relative to a card
                            const destinationIndex =
                                closestEdgeOfTarget === 'bottom' ? indexOfTarget + 1 : indexOfTarget;

                            moveCard({
                                itemIndexInStartColumn: itemIndex,
                                startColumnId: startColumnId,
                                finishColumnId: destinationColumnId,
                                itemIndexInFinishColumn: destinationIndex,
                                trigger: 'pointer',
                            });
                        }
                    }
                },
            }),
        );
    }, [boardState, instanceId, moveCard, reorderCard]); // Rerun monitor setup if boardState or callbacks change

    // --- Context Value --- (Memoize to prevent unnecessary re-renders)
    const contextValue: BoardContextValue = useMemo(() => ({
        reorderCard,
        moveCard,
        registerCard: registry.cardRegistry.register,
        registerColumn: registry.columnRegistry.register,
        instanceId,
    }), [reorderCard, moveCard, registry.cardRegistry, registry.columnRegistry, instanceId]);


    if (isLoading) {
        return <div className="p-4 text-center text-stone-500 dark:text-stone-400">Loading board...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded">{error}</div>;
    }

    if (!boardInfo || !boardState) { // Check both boardInfo and boardState
        return <div className="p-4 text-center text-stone-500 dark:text-stone-400">Board data not available.</div>;
    }

    return (
        <BoardProvider value={contextValue}> {/* Wrap with context provider */}
            <div className="p-4">
                <h1 className="text-2xl font-semibold mb-1 text-stone-900 dark:text-white">{boardInfo.name}</h1>
                <p className="text-sm text-stone-600 dark:text-stone-400 mb-6">{boardInfo.description}</p>

                {/* Remove DndContext, DragOverlay, SortableContext */}
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {/* Render columns based on orderedColumnIds */}
                    {boardState.orderedColumnIds.map(columnId => {
                        const column = boardState.columnMap[columnId];
                        if (!column) return null; // Should not happen
                        return <Column key={column._id} column={column} />;
                    })}
                </div>
            </div>
        </BoardProvider>
    );
};

export default BoardDetail;