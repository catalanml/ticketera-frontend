import React, { useState, useEffect } from 'react';
import { FlagIcon } from '@heroicons/react/24/solid';
import { fetchCategories } from '../services/category/categoryService';
import { fetchUsers } from '../services/user/userService'; // Import fetchUsers
import { useAuth } from '../hooks/useAuth';
import { AxiosError } from 'axios';
// Import types from the central types file
import { ICategory, IUser, TaskStatusEnum } from '../types';


// Define priorities - color class will be determined by helper function
const priorities = [
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


const TaskForm: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [users, setUsers] = useState<IUser[]>([]); // State for fetched users
  const [isLoadingUsers, setIsLoadingUsers] = useState(true); // Loading state for users
  const [errorUsers, setErrorUsers] = useState<string | null>(null); // Error state for users
  const [priority, setPriority] = useState<number>(1);
  const [status, setStatus] = useState<TaskStatusEnum>(TaskStatusEnum.ToDo);
  const [dueDate, setDueDate] = useState<string>('');

  // Fetch categories effect (keep as is)
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoadingCategories(true);
      setErrorCategories(null);
      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Use AxiosError type guard
        if (error instanceof AxiosError && error.response?.status === 401) {
          setErrorCategories('Authentication error. Please log in again.');
        } else {
          setErrorCategories('Failed to load categories. Please try again.');
        }
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isAuthenticated) { // Only fetch if authenticated
      loadCategories();
    } else {
      // Optionally clear categories or set an appropriate state if user logs out
      setCategories([]);
      setIsLoadingCategories(false);
      // setErrorCategories('Please log in to see categories.'); // Or keep error null
    }
  }, [isAuthenticated]); // Add isAuthenticated as a dependency

  // Fetch users effect
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      setErrorUsers(null);
      try {
        const fetchedUsers = await fetchUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Failed to load users:', error);
        if (error instanceof AxiosError && error.response?.status === 401) {
          setErrorUsers('Authentication error fetching users.');
        } else {
          setErrorUsers('Failed to load users.');
        }
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isAuthenticated) { // Only fetch if authenticated
      loadUsers();
    } else {
      // Clear users if not authenticated
      setUsers([]);
      setIsLoadingUsers(false);
    }
  }, [isAuthenticated]); // Add isAuthenticated as a dependency

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // TODO: Implement actual task creation logic here
    console.log({
      name,
      description,
      category,
      assignedTo,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : null, // Convert string back to Date
    });
    // Reset form or close modal after submission
  };

  return (
    <div className="pt-0 px-4 pb-4">
      <h2 className="text-xl font-bold mb-6 text-stone-800 dark:text-stone-200">Create New Task</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="task-name" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Task Name</label>
          <input
            type="text"
            id="task-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-description" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Description</label>
          <textarea
            id="task-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label htmlFor="task-category" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Category</label>
            <select
              id="task-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={isLoadingCategories || !!errorCategories || !isAuthenticated} // Also disable if not authenticated
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-50"
            >
              <option value="" disabled>
                {!isAuthenticated
                  ? 'Please log in'
                  : isLoadingCategories
                    ? 'Loading categories...'
                    : errorCategories
                      ? 'Error loading'
                      : 'Select a category'}
              </option>
              {/* Only map categories if authenticated, not loading, and no error */}
              {isAuthenticated && !isLoadingCategories && !errorCategories && categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            {errorCategories && <p className="text-xs text-red-600 mt-1">{errorCategories}</p>}
          </div>

          {/* Assigned To */}
          <div>
            <label htmlFor="task-assignedTo" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Assigned To (Optional)</label>
            <select
              id="task-assignedTo"
              value={assignedTo ?? ''}
              onChange={(e) => setAssignedTo(e.target.value || null)}
              // Disable if not authenticated, loading, or error
              disabled={!isAuthenticated || isLoadingUsers || !!errorUsers}
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 disabled:opacity-50"
            >
              <option value="" disabled={isLoadingUsers || !!errorUsers}>
                {!isAuthenticated
                  ? 'Please log in'
                  : isLoadingUsers
                    ? 'Loading users...'
                    : errorUsers
                      ? 'Error loading users'
                      : 'Unassigned'}
              </option>
              {/* Map over fetched users */}
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
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatusEnum)}
              required
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            >
              {Object.values(TaskStatusEnum).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label htmlFor="task-dueDate" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">Due Date</label>
            <input
              type="date"
              id="task-dueDate"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100"
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Priority</label>
          <div className="flex space-x-3 items-center">
            {priorities.map(p => (
              <button
                key={p.level}
                type="button" // Prevent form submission
                onClick={() => setPriority(p.level)}
                className={`flex items-center justify-center p-2 rounded-md border transition-all duration-150 ease-in-out ${priority === p.level
                  ? 'ring-2 ring-offset-2 dark:ring-offset-stone-800 ring-indigo-500 border-indigo-500'
                  : 'border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500'
                  }`}
                title={p.name}
              >
                {/* Use helper function to get color class */}
                <FlagIcon
                  className={`h-5 w-5 ${getPriorityColorClass(p.level)}`} // Apply text color using helper function
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
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-white dark:text-black dark:hover:bg-stone-300 dark:ring-offset-stone-800"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;