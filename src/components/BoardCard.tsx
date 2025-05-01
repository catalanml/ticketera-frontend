import React from 'react';
import { IBoard } from '../types';
import { Link } from 'react-router-dom';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface BoardCardProps {
    board: IBoard;
    onEdit: (board: IBoard) => void; // Function to trigger editing
    onDelete: (boardId: string) => void; // Function to trigger deletion
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onEdit, onDelete }) => {
    // Basic display for now, can be enhanced later
    return (
        <div className="rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-black p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-semibold text-stone-900 dark:text-white mb-1 truncate">
                    {/* Link to a potential board detail view later */}
                    <Link to={`/boards/${board._id}`} className="hover:underline">
                        {board.name}
                    </Link>
                </h3>
                {board.description && (
                    <p className="text-sm text-stone-500 dark:text-white/60 mb-3 line-clamp-2">
                        {board.description}
                    </p>
                )}
            </div>
            <div className="flex justify-end items-center gap-2 mt-2">
                {/* Edit Button */}
                <button
                    onClick={() => onEdit(board)}
                    className="p-1 text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-white transition-colors"
                    aria-label={`Edit board ${board.name}`}
                    title="Edit Board"
                >
                    <PencilSquareIcon className="h-5 w-5" />
                </button>
                {/* Delete Button */}
                <button
                    onClick={() => onDelete(board._id)}
                    className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    aria-label={`Delete board ${board.name}`}
                    title="Delete Board"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default BoardCard;
