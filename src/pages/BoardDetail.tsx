// File: /home/lcatalan/projects/ticketera-frontend/src/pages/BoardDetail.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { IBoard, ITask, IStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import Column from '../components/Column';
import Modal from '../components/Modal';
import TaskForm from '../components/TaskForm';
import { AxiosError } from 'axios';
import invariant from 'tiny-invariant';

// Pragmatic DND imports
import { triggerPostMoveFlash } from '@atlaskit/pragmatic-drag-and-drop-flourish/trigger-post-move-flash';
import { extractClosestEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/types';
import { getReorderDestinationIndex } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder as reorderItems } from '@atlaskit/pragmatic-drag-and-drop/reorder'; // Renamed import

// Board Context and Registry
import { BoardProvider, createRegistry, BoardContextValue } from '../context/BoardContext';

// Define the structure for columns based on statuses
interface BoardColumn extends IStatus {
    tasks: ITask[];
}

// Type for the board state
type BoardState = {
    columnMap: { [key: string]: BoardColumn };
    orderedColumnIds: string[];
};

const BoardDetail: React.FC = () => {
    const { boardId } = useParams<{ boardId: string }>();
    const { isAuthenticated } = useAuth();
    const [boardInfo, setBoardInfo] = useState<IBoard | null>(null);
    const [boardState, setBoardState] = useState<BoardState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

    const stableBoardState = useRef(boardState);
    useEffect(() => {
        stableBoardState.current = boardState;
    }, [boardState]);

    const [dndRegistry] = useState(() => createRegistry());
    const [instanceId] = useState(() => Symbol('board-instance'));

    const fetchAndSetBoardDetails = useCallback(async () => {
        if (!isAuthenticated || !boardId) {
            setError("Authentication required or Board ID missing.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            // TODO: Replace with actual API calls
            // Fetch board info, statuses, and tasks for the boardId
            // const fetchedBoardInfo = await fetchBoardById(boardId);
            // const fetchedStatuses = await fetchStatusesByBoardId(boardId);
            // const fetchedTasks = await fetchTasksByBoardId(boardId);

            // --- Placeholder Data --- (Remove when API calls are implemented)
            const placeholderBoard: IBoard = { _id: boardId!, name: 'Placeholder Board', description: 'This is a placeholder board.', createdBy: 'placeholder-user-id', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            const placeholderStatuses: IStatus[] = [
                { _id: 'todo', name: 'To Do', boardId: boardId!, order: 0 },
                { _id: 'inprogress', name: 'In Progress', boardId: boardId!, order: 1 },
                { _id: 'done', name: 'Done', boardId: boardId!, order: 2 },
            ];
            const placeholderTasks: ITask[] = [
                { _id: 'task-1', title: 'Task 1', description: 'Desc 1', status: 'todo', boardId: boardId!, order: 0, priority: 'Medium', createdBy: 'user-1' },
                { _id: 'task-2', title: 'Task 2', description: 'Desc 2', status: 'todo', boardId: boardId!, order: 1, priority: 'Low', createdBy: 'user-1' },
                { _id: 'task-3', title: 'Task 3', description: 'Desc 3', status: 'inprogress', boardId: boardId!, order: 0, priority: 'High', createdBy: 'user-2' },
            ];
            setBoardInfo(placeholderBoard);
            // --- End Placeholder Data ---

            // Process data into the BoardState structure
            const columnsMap: { [key: string]: BoardColumn } = {};
            const orderedIds = placeholderStatuses // Use fetchedStatuses when API is ready
                .sort((a, b) => a.order - b.order)
                .map(status => {
                    columnsMap[status._id] = { ...status, tasks: [] };
                    return status._id;
                });

            placeholderTasks.forEach(task => { // Use fetchedTasks when API is ready
                const statusKey = task.status as string;
                const column = columnsMap[statusKey];
                if (column) {
                    // Ensure task has an order property before pushing
                    if (typeof task.order !== 'number') {
                        console.warn(`Task ${task._id} is missing 'order' property. Assigning default 0.`);
                        task.order = column.tasks.length; // Assign order based on current length
                    }
                    column.tasks.push(task);
                } else {
                    console.warn(`Task ${task._id} has status '${statusKey}' which does not match any column.`);
                }
            });

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
        fetchAndSetBoardDetails();
    }, [fetchAndSetBoardDetails]);

    const handleOpenCreateTaskModal = () => setIsCreateTaskModalOpen(true);
    const handleCloseCreateTaskModal = () => setIsCreateTaskModalOpen(false);

    const handleTaskCreated = useCallback(() => {
        console.log("Task created, refetching board details...");
        fetchAndSetBoardDetails();
    }, [fetchAndSetBoardDetails]);

    // --- State Update Functions ---
    const reorderCard = useCallback(
        ({
            columnId,
            startIndex,
            finishIndex,
        }: {
            columnId: string;
            startIndex: number;
            finishIndex: number;
            trigger?: 'pointer' | 'keyboard'; // trigger is unused currently, but kept for potential future use
        }) => {
            setBoardState((currentState) => {
                if (!currentState) return null;

                const sourceColumn = currentState.columnMap[columnId];
                if (!sourceColumn) return currentState;

                const updatedItems = reorderItems({
                    list: sourceColumn.tasks,
                    startIndex,
                    finishIndex,
                });

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
                console.log('Reordering in column:', columnId, updatedTasksWithOrder.map(t => ({ id: t._id, order: t.order })));

                const finalItem = updatedTasksWithOrder[finishIndex];
                if (finalItem) {
                    const cardEntry = dndRegistry.cardRegistry.getCard(finalItem._id);
                    if (cardEntry) {
                        triggerPostMoveFlash(cardEntry.element);
                    }
                }

                // Ensure the return type matches BoardState
                return {
                    ...currentState,
                    columnMap: updatedMap,
                    orderedColumnIds: currentState.orderedColumnIds // Keep orderedColumnIds
                };
            });
        },
        [dndRegistry.cardRegistry],
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
            trigger?: 'pointer' | 'keyboard'; // trigger is unused currently
        }) => {
            if (startColumnId === finishColumnId) {
                return; // Should not happen if logic is correct, but good safeguard
            }
            setBoardState((currentState) => {
                if (!currentState) return null;

                const sourceColumn = currentState.columnMap[startColumnId];
                const destinationColumn = currentState.columnMap[finishColumnId];
                if (!sourceColumn || !destinationColumn) return currentState;

                const item: ITask | undefined = sourceColumn.tasks[itemIndexInStartColumn];
                if (!item) return currentState;

                // Remove from source
                const newSourceTasks = sourceColumn.tasks.filter((i) => i._id !== item._id);
                const updatedSourceTasksWithOrder = newSourceTasks.map((task, index) => ({
                    ...task,
                    order: index,
                }));

                // Add to destination
                const destinationItems = Array.from(destinationColumn.tasks);
                const newIndexInDestination = itemIndexInFinishColumn ?? destinationItems.length;

                const movedItem = { ...item, status: finishColumnId }; // Update status
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
                console.log('New order in target column:', updatedDestinationTasksWithOrder.map(t => ({ id: t._id, order: t.order })));
                console.log('New order in source column:', updatedSourceTasksWithOrder.map(t => ({ id: t._id, order: t.order })));

                const finalItem = updatedDestinationTasksWithOrder[newIndexInDestination];
                if (finalItem) {
                    setTimeout(() => {
                        const cardEntry = dndRegistry.cardRegistry.getCard(finalItem._id);
                        if (cardEntry) {
                            triggerPostMoveFlash(cardEntry.element);
                        }
                    }, 0);
                }

                // Ensure the return type matches BoardState
                return {
                    ...currentState,
                    columnMap: updatedMap,
                    orderedColumnIds: currentState.orderedColumnIds // Keep orderedColumnIds
                };
            });
        },
        [dndRegistry.cardRegistry],
    );

    // --- Drag and Drop Monitor Effect ---
    useEffect(() => {
        if (!boardState) {
            return;
        }

        return combine(
            monitorForElements({
                canMonitor({ source }) {
                    return source.data.instanceId === instanceId;
                },
                onDrop(args) {
                    const { location, source } = args;
                    const currentBoardState = stableBoardState.current;

                    if (!location.current.dropTargets.length || !currentBoardState) {
                        return;
                    }

                    if (source.data.type === 'card') {
                        const taskId = source.data.taskId as string;
                        const startColumnId = source.data.columnId as string;
                        const sourceColumn = currentBoardState.columnMap[startColumnId];
                        const itemIndex = sourceColumn.tasks.findIndex((task) => task._id === taskId);
                        if (itemIndex < 0) return;

                        if (location.current.dropTargets.length === 1) {
                            const [destinationColumnRecord] = location.current.dropTargets;
                            const destinationColumnId = destinationColumnRecord.data.columnId as string;
                            const destinationColumn = currentBoardState.columnMap[destinationColumnId];
                            invariant(destinationColumn, 'Could not find destination column');

                            if (startColumnId === destinationColumnId) {
                                const destinationIndex = getReorderDestinationIndex({
                                    startIndex: itemIndex,
                                    indexOfTarget: sourceColumn.tasks.length - 1,
                                    closestEdgeOfTarget: null,
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

                            moveCard({
                                itemIndexInStartColumn: itemIndex,
                                startColumnId: startColumnId,
                                finishColumnId: destinationColumnId,
                                itemIndexInFinishColumn: destinationColumn.tasks.length,
                                trigger: 'pointer',
                            });
                            return;
                        }

                        if (location.current.dropTargets.length === 2) {
                            const [destinationCardRecord, destinationColumnRecord] = location.current.dropTargets;
                            const destinationColumnId = destinationColumnRecord.data.columnId as string;
                            const destinationColumn = currentBoardState.columnMap[destinationColumnId];
                            invariant(destinationColumn, 'Could not find destination column');

                            const targetTaskId = destinationCardRecord.data.taskId as string;
                            const indexOfTarget = destinationColumn.tasks.findIndex(
                                (task) => task._id === targetTaskId,
                            );
                            if (indexOfTarget < 0) return;

                            const closestEdgeOfTarget: Edge | null = extractClosestEdge(
                                destinationCardRecord.data,
                            );

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [instanceId, moveCard, reorderCard, dndRegistry]);

    // --- Context Value ---
    const contextValue: BoardContextValue = useMemo(() => ({
        reorderCard,
        moveCard,
        registerCard: dndRegistry.cardRegistry.register,
        registerColumn: dndRegistry.columnRegistry.register,
        instanceId,
    }), [reorderCard, moveCard, dndRegistry.cardRegistry, dndRegistry.columnRegistry, instanceId]);

    // --- Render Logic ---
    if (isLoading) {
        // Corrected className quotes
        return <div className="p-4 text-center text-stone-500 dark:text-stone-400">Loading board...</div>;
    }

    if (error) {
        // Corrected className quotes
        return <div className="p-4 text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded">{error}</div>;
    }

    if (!boardInfo || !boardState) {
        // Corrected className quotes
        return <div className="p-4 text-center text-stone-500 dark:text-stone-400">Board data not available.</div>;
    }

    // Component now returns JSX, satisfying React.FC
    return (
        <BoardProvider value={contextValue}>
            <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-stone-900 dark:text-white">{boardInfo.name}</h1>
                        <p className="text-sm text-stone-600 dark:text-stone-400">{boardInfo.description}</p>
                    </div>
                    <button
                        onClick={handleOpenCreateTaskModal}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-white dark:text-black dark:hover:bg-stone-300 dark:ring-offset-stone-800"
                    >
                        Add Task
                    </button>
                </div>

                <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
                    {boardState.orderedColumnIds.map(columnId => {
                        const column = boardState.columnMap[columnId];
                        if (!column) return null;
                        return <Column key={column._id} column={column} />;
                    })}
                </div>
            </div>

            <Modal isOpen={isCreateTaskModalOpen} onClose={handleCloseCreateTaskModal}>
                <TaskForm
                    boardId={boardId}
                    onTaskCreated={handleTaskCreated}
                    onClose={handleCloseCreateTaskModal}
                />
            </Modal>
        </BoardProvider>
    );
};

export default BoardDetail;
