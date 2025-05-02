// src/services/task/taskService.ts
import axiosInstance from '../axiosConfig';
import { ITask, CreateTaskDTO, UpdateTaskDTO } from '../../types';

const BASE_URL = '/tasks'; // Base URL for task endpoints

/**
 * Fetches tasks from the API, optionally filtering by board, category, or status.
 * Requires authentication.
 * @param {object} [filters] - Optional filters.
 * @param {string} [filters.boardId] - Filter by Board ID.
 * @param {string} [filters.categoryId] - Filter by Category ID.
 * @param {string} [filters.status] - Filter by Task Status.
 * @returns {Promise<ITask[]>} A promise that resolves to an array of tasks.
 */
export const fetchTasks = async (filters?: { boardId?: string; categoryId?: string; status?: string }): Promise<ITask[]> => {
    const response = await axiosInstance.get<ITask[]>(BASE_URL, {
        params: filters, // Pass filters as query parameters
    });
    // Assuming the backend directly returns the array of tasks
    // Adjust if the response has a different structure (e.g., { message: '...', tasks: [...] })
    return response.data;
};


/**
 * Fetches a single task by its ID.
 * Requires authentication.
 * @param {string} taskId - The ID of the task to fetch.
 * @returns {Promise<ITask>} A promise that resolves to the task data.
 */
export const getTaskById = async (taskId: string): Promise<ITask> => {
    const response = await axiosInstance.get<ITask>(`${BASE_URL}/${taskId}`);
    return response.data;
};

/**
 * Creates a new task.
 * Requires authentication.
 * @param {CreateTaskDTO} taskData - The data for the new task.
 * @param {string} [boardId] - Optional ID of the board the task belongs to.
 * @returns {Promise<ITask>} A promise that resolves to the newly created task data.
 */
export const createTask = async (taskData: CreateTaskDTO, boardId?: string): Promise<ITask> => {
    // Include boardId in the payload only if it's provided
    const payload = boardId ? { ...taskData, boardId } : taskData;
    const response = await axiosInstance.post<ITask>(BASE_URL, payload);
    return response.data;
};

/**
 * Updates an existing task.
 * Requires authentication.
 * @param {string} taskId - The ID of the task to update.
 * @param {UpdateTaskDTO} taskData - The data to update the task with.
 * @returns {Promise<ITask>} A promise that resolves to the updated task data.
 */
export const updateTask = async (taskId: string, taskData: UpdateTaskDTO): Promise<ITask> => {
    const response = await axiosInstance.put<ITask>(`${BASE_URL}/${taskId}`, taskData);
    return response.data;
};

/**
 * Deletes a task by its ID.
 * Requires authentication.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>} A promise that resolves when the task is deleted.
 */
export const deleteTask = async (taskId: string): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${taskId}`);
};
