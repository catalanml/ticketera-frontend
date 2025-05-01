import React, { useState, useEffect, useCallback } from 'react';
import { fetchBoards, deleteBoard, createBoard, updateBoard } from '../services/board/boardService'; // Import create/update
import { IBoard, CreateBoardDTO, UpdateBoardDTO } from '../types';
import { useAuth } from '../hooks/useAuth';
import BoardCard from '../components/BoardCard';
import Modal from '../components/Modal';
import { PlusIcon } from '@heroicons/react/24/solid';
import { AxiosError } from 'axios'; // Import AxiosError

// --- BoardForm Component (Moved to its own file eventually) ---
interface BoardFormProps {
    existingBoard: IBoard | null;
    onSave: () => void;
    onCancel: () => void; // Add cancel handler
}

const BoardForm: React.FC<BoardFormProps> = ({ existingBoard, onSave, onCancel }) => {
    const [name, setName] = useState(existingBoard?.name || '');
    const [description, setDescription] = useState(existingBoard?.description || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Reset form when existingBoard changes (e.g., opening modal for different board)
    useEffect(() => {
        setName(existingBoard?.name || '');
        setDescription(existingBoard?.description || '');
        setFormError(null); // Clear previous errors
        setIsSubmitting(false); // Reset submitting state
    }, [existingBoard]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormError(null);
        try {
            const boardData: CreateBoardDTO | UpdateBoardDTO = { name, description: description || undefined }; // Ensure description is optional

            if (existingBoard) {
                await updateBoard(existingBoard._id, boardData as UpdateBoardDTO);
            } else {
                await createBoard(boardData as CreateBoardDTO);
            }
            onSave(); // Trigger refresh and close modal
        } catch (err: unknown) { // Use unknown instead of any
            console.error("Error saving board:", err);
            let message = "Failed to save board. Please check your input and try again.";
            if (err instanceof AxiosError && err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            setFormError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="pt-0 px-4 pb-4">
            <h2 className="text-xl font-bold mb-6 text-stone-800 dark:text-stone-200">
                {existingBoard ? 'Edit Board' : 'Create New Board'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                    <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300" role="alert">
                        {formError}
                    </div>
                )}
                <div>
                    <label htmlFor="board-name" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Board Name</label>
                    <input
                        type="text"
                        id="board-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-50"
                    />
                </div>
                <div>
                    <label htmlFor="board-description" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description (Optional)</label>
                    <textarea
                        id="board-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-50"
                    />
                </div>
                <div className="flex justify-end items-center gap-3 pt-4">
                    <button
                        type="button" // Important: Prevent form submission
                        onClick={onCancel} // Call cancel handler
                        disabled={isSubmitting}
                        className="px-4 py-2 text-sm font-medium rounded-md border border-stone-300 dark:border-white/20 text-stone-700 dark:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-stone-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Saving...' : (existingBoard ? 'Save Changes' : 'Create Board')}
                    </button>
                </div>
            </form>
        </div>
    );
};
// --- End BoardForm Component ---


const BoardsPage: React.FC = () => {
    const [boards, setBoards] = useState<IBoard[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { isAuthenticated } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBoard, setEditingBoard] = useState<IBoard | null>(null); // Board to edit

    const loadBoards = useCallback(async () => {
        if (!isAuthenticated) {
            setError("Please log in to view boards.");
            setIsLoading(false);
            setBoards([]);
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const fetchedBoards = await fetchBoards();
            setBoards(fetchedBoards);
        } catch (err: unknown) { // Use unknown instead of any
            console.error("Error fetching boards:", err);
            let message = "Failed to load boards. Please try again.";
            if (err instanceof AxiosError && err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadBoards();
    }, [loadBoards]); // Reload when auth state changes or component mounts

    const handleOpenCreateModal = () => {
        setEditingBoard(null); // Ensure we are creating, not editing
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (board: IBoard) => {
        setEditingBoard(board);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        // No need to clear editingBoard here, BoardForm's useEffect handles it
    };

    const handleBoardSaved = () => {
        handleCloseModal();
        loadBoards(); // Refresh the list after saving
    };

    const handleDeleteBoard = async (boardId: string) => {
        if (!window.confirm("Are you sure you want to delete this board? This action cannot be undone.")) {
            return;
        }
        // Optional: Add loading state for delete
        try {
            await deleteBoard(boardId);
            setBoards(prevBoards => prevBoards.filter(board => board._id !== boardId));
            // Optional: Show success message
        } catch (err: unknown) { // Use unknown instead of any
            console.error("Error deleting board:", err);
            let message = "Failed to delete board. Please try again.";
            if (err instanceof AxiosError && err.response?.data?.message) {
                message = err.response.data.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            // Show error message to the user, maybe using a toast notification library later
            alert(`Error: ${message}`); // Simple alert for now
            setError(message); // Also set page-level error if desired
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-stone-900 dark:text-white">
                    My Boards
                </h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-black"
                >
                    <PlusIcon className="h-5 w-5" />
                    Create Board
                </button>
            </div>

            {error && (
                <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-300" role="alert">
                    {error}
                </div>
            )}

            {isLoading ? (
                // Basic Loading Indicator - TODO: Replace with Skeletons
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-black p-4 shadow-sm animate-pulse">
                            <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-full mb-1"></div>
                            <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-5/6 mb-3"></div>
                            <div className="flex justify-end gap-2 mt-2">
                                <div className="h-7 w-7 bg-stone-200 dark:bg-stone-700 rounded"></div>
                                <div className="h-7 w-7 bg-stone-200 dark:bg-stone-700 rounded"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : boards.length === 0 && !error ? (
                <div className="text-center py-16 text-stone-500 dark:text-white/60 border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-lg">
                    <h3 className="text-lg font-medium">No boards found</h3>
                    <p className="mt-1 text-sm">Get started by creating your first board.</p>
                    <button
                        onClick={handleOpenCreateModal}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:ring-offset-black"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Create Board
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {boards.map((board) => (
                        <BoardCard
                            key={board._id}
                            board={board}
                            onEdit={handleOpenEditModal}
                            onDelete={handleDeleteBoard}
                        />
                    ))}
                </div>
            )}

            {/* Modal for Creating/Editing Boards */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <BoardForm
                    existingBoard={editingBoard}
                    onSave={handleBoardSaved}
                    onCancel={handleCloseModal} // Pass close handler as cancel
                />
            </Modal>
        </div>
    );
};

export default BoardsPage;
