import React from 'react';
import { FlagIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth';
import { AxiosError } from 'axios';
import { TaskStatusEnum, CreateTaskDTO, ITask } from '../types';
import { createTask } from '../services/task/taskService';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTaskFormData } from '../hooks/useTaskFormData';
import { useTaskContext } from '../hooks/useTaskContext'; // Import from the new hook file
import toast from 'react-hot-toast';


// Define priorities with both level and name
const priorities: { level: number; name: 'Low' | 'Medium' | 'High' }[] = [
  { level: 1, name: 'Low' },
  { level: 2, name: 'Medium' },
  { level: 3, name: 'High' },
];

// Helper function to get the Tailwind text color class
const getPriorityColorClass = (level: number): string => {
  switch (level) {
    case 1: return 'text-green-500';
    case 2: return 'text-yellow-500';
    case 3: return 'text-red-500';
    default: return 'text-stone-500'; // Fallback color
  }
};

// Define props for the component
interface TaskFormProps {
  boardId?: string; // Optional: If provided, task is added to this board, dropdown hidden
  onTaskCreated?: (newTask: ITask) => void; // Optional: Callback after task creation
  onClose?: () => void; // Optional: Callback to close the form/modal
}

// Define the shape of our form data
interface TaskFormData {
  boardId?: string; // Only used if showBoardSelector is true
  title: string;
  description?: string;
  category?: string;
  assignedTo?: string;
  status: TaskStatusEnum;
  dueDate?: string;
  priorityLevel: number; // Keep priorityLevel for the button group state
}

const TaskForm: React.FC<TaskFormProps> = ({ boardId, onTaskCreated, onClose }) => {
  const { isAuthenticated } = useAuth();
  const { triggerRefresh } = useTaskContext(); // Get the triggerRefresh function
  const showBoardSelector = !boardId;

  // Use the custom hook to fetch data
  const {
    categories, isLoadingCategories, errorCategories,
    users, isLoadingUsers, errorUsers,
    boards, isLoadingBoards, errorBoards
  } = useTaskFormData(showBoardSelector);

  // Setup react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      assignedTo: '',
      status: TaskStatusEnum.ToDo,
      dueDate: '',
      priorityLevel: 2, // Default priority
      boardId: boardId || '', // Pre-fill if boardId prop is provided
    }
  });

  // Watch the priorityLevel to update the button UI
  const currentPriorityLevel = watch('priorityLevel');

  // Map priority level (number) to priority name (string)
  const getPriorityName = (level: number): 'Low' | 'Medium' | 'High' => {
    const foundPriority = priorities.find(p => p.level === level);
    return foundPriority ? foundPriority.name : 'Medium'; // Default to Medium if not found
  };

  // Handle form submission using react-hook-form's handler
  const onSubmit: SubmitHandler<TaskFormData> = async (data) => {
    // Check authentication
    if (!isAuthenticated) return;

    // Find the priority name corresponding to the selected level
    const priorityName = getPriorityName(data.priorityLevel);

    // Construct the DTO from react-hook-form data
    const taskData: CreateTaskDTO = {
      title: data.title,
      description: data.description || undefined,
      status: data.status,
      priority: priorityName,
      category: data.category || undefined,
      assignedTo: data.assignedTo || undefined,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    };

    try {
      // Determine the target board ID just before calling createTask
      const targetBoardId = boardId || data.boardId || undefined;
      console.log('Submitting task data:', taskData, 'for board:', targetBoardId);
      const newTask = await createTask(taskData, targetBoardId);
      console.log('Task created successfully:', newTask);

      reset(); // Reset form fields

      onTaskCreated?.(newTask); // Call optional callback
      onClose?.(); // Close the modal
      triggerRefresh(); // <--- Trigger the refresh signal

      // Show success toast notification
      toast.success('Task created successfully!');

    } catch (error) {
      console.error('Failed to create task:', error);
      let errorMessage = 'Failed to create task. Please try again.';
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          errorMessage = 'Authentication error. Please log in again.';
        } else if (error.response?.data?.message) {
          errorMessage = typeof error.response.data.message === 'string'
            ? error.response.data.message
            : JSON.stringify(error.response.data.message);
        }
      }
      // Show error toast notification
      toast.error(errorMessage);
    }
  };

  return (
    <div className="pt-0 px-4 pb-4">
      <h2 className="text-xl font-bold mb-6 text-stone-800 dark:text-stone-200">Create New Task</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Board Selector (Conditional) */}
        {showBoardSelector && (
          <div>
            <label htmlFor="task-board" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Board (Optional)</label>
            <select
              id="task-board"
              // Removed required validation for boardId
              {...register('boardId')}
              disabled={isLoadingBoards || !!errorBoards || !isAuthenticated || isSubmitting}
              className={`w-full px-3 py-2 border ${errors.boardId ? 'border-red-500' : 'border-stone-300 dark:border-stone-600'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-50`}
            >
              <option value="">
                {/* Updated placeholder text */}
                {!isAuthenticated
                  ? 'Please log in'
                  : isLoadingBoards
                    ? 'Loading boards...'
                    : errorBoards
                      ? 'Error loading boards'
                      : 'Select a board (Optional)'}
              </option>
              {isAuthenticated && !isLoadingBoards && !errorBoards && boards.map(b => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
            {/* Error message for boardId is no longer needed unless other validation is added */}
            {/* {errors.boardId && <p className="text-xs text-red-600 mt-1">{errors.boardId.message}</p>} */}
            {errorBoards && <p className="text-xs text-red-600 mt-1">{errorBoards}</p>}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="task-title" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Task Title</label>
          <input
            type="text"
            id="task-title"
            {...register('title', { required: 'Task title is required.' })}
            className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-stone-300 dark:border-stone-600'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100`}
            disabled={isSubmitting}
          />
          {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description (Optional)</label>
          <textarea
            id="task-description"
            {...register('description')}
            rows={3}
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="task-category" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Category</label>
            <select
              id="task-category"
              // Added required validation for category
              {...register('category', { required: 'Please select a category.' })}
              disabled={isLoadingCategories || !!errorCategories || !isAuthenticated || isSubmitting}
              // Added error styling based on errors.category
              className={`w-full px-3 py-2 border ${errors.category ? 'border-red-500' : 'border-stone-300 dark:border-stone-600'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-50`}
            >
              <option value="">
                {/* Updated placeholder text */}
                {!isAuthenticated
                  ? 'Please log in'
                  : isLoadingCategories
                    ? 'Loading...'
                    : errorCategories
                      ? 'Error'
                      : 'Select category'}
              </option>
              {isAuthenticated && !isLoadingCategories && !errorCategories && categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {/* Display validation error for category */}
            {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>}
            {errorCategories && !errors.category && <p className="text-xs text-red-600 mt-1">{errorCategories}</p>}
          </div>

          {/* Assigned To */}
          <div>
            <label htmlFor="task-assignedTo" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Assigned To (Optional)</label>
            <select
              id="task-assignedTo"
              {...register('assignedTo')}
              disabled={!isAuthenticated || isLoadingUsers || !!errorUsers || isSubmitting}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-50"
            >
              <option value="">
                {!isAuthenticated
                  ? 'Please log in'
                  : isLoadingUsers
                    ? 'Loading...'
                    : errorUsers
                      ? 'Error'
                      : 'Unassigned'}
              </option>
              {isAuthenticated && !isLoadingUsers && !errorUsers && users.map(user => (
                <option key={user._id} value={user._id}>{user.name}</option>
              ))}
            </select>
            {errorUsers && <p className="text-xs text-red-600 mt-1">{errorUsers}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label htmlFor="task-status" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Status</label>
            <select
              id="task-status"
              {...register('status', { required: 'Status is required.' })}
              className={`w-full px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-stone-300 dark:border-stone-600'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100`}
              disabled={isSubmitting}
            >
              {Object.values(TaskStatusEnum).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.status && <p className="text-xs text-red-600 mt-1">{errors.status.message}</p>}
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="task-dueDate" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Due Date (Optional)</label>
            <input
              type="date"
              id="task-dueDate"
              {...register('dueDate')}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Priority</label>
          <input type="hidden" {...register('priorityLevel')} />
          <div className="flex space-x-3 items-center">
            {priorities.map(p => (
              <button
                key={p.level}
                type="button"
                onClick={() => !isSubmitting && setValue('priorityLevel', p.level, { shouldValidate: true })}
                className={`flex items-center justify-center p-2 rounded-md border transition-all duration-150 ease-in-out ${currentPriorityLevel === p.level
                  ? 'ring-2 ring-offset-2 dark:ring-offset-stone-800 ring-indigo-500 border-indigo-500'
                  : 'border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={p.name}
                disabled={isSubmitting}
              >
                <FlagIcon
                  className={`h-5 w-5 ${getPriorityColorClass(p.level)}`}
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-white dark:text-black dark:hover:bg-stone-300 dark:ring-offset-stone-800 disabled:opacity-50"
            disabled={!isAuthenticated || isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;