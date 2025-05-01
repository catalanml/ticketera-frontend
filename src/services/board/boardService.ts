// src/services/board/boardService.ts
import axiosInstance from '../axiosConfig';
import { IBoard, CreateBoardDTO, UpdateBoardDTO } from '../../types';

const BASE_URL = '/boards'; // Assuming '/api' is handled by baseURL in axiosConfig

/**
 * Fetches all boards from the API.
 * Requires authentication.
 * @returns {Promise<IBoard[]>} A promise that resolves to an array of boards.
 */
export const fetchBoards = async (): Promise<IBoard[]> => {
    const response = await axiosInstance.get<IBoard[]>(BASE_URL);
    // Assuming the backend directly returns the array of boards
    // Adjust if the response has a different structure (e.g., { message: '...', boards: [...] })
    return response.data;
};

/**
 * Fetches a single board by its ID.
 * Requires authentication.
 * @param {string} boardId - The ID of the board to fetch.
 * @returns {Promise<IBoard>} A promise that resolves to the board data.
 */
export const getBoardById = async (boardId: string): Promise<IBoard> => {
    const response = await axiosInstance.get<IBoard>(`${BASE_URL}/${boardId}`);
    return response.data;
};

/**
 * Creates a new board.
 * Requires authentication.
 * @param {CreateBoardDTO} boardData - The data for the new board.
 * @returns {Promise<IBoard>} A promise that resolves to the newly created board data.
 */
export const createBoard = async (boardData: CreateBoardDTO): Promise<IBoard> => {
    const response = await axiosInstance.post<IBoard>(BASE_URL, boardData);
    return response.data;
};

/**
 * Updates an existing board.
 * Requires authentication.
 * @param {string} boardId - The ID of the board to update.
 * @param {UpdateBoardDTO} boardData - The data to update the board with.
 * @returns {Promise<IBoard>} A promise that resolves to the updated board data.
 */
export const updateBoard = async (boardId: string, boardData: UpdateBoardDTO): Promise<IBoard> => {
    const response = await axiosInstance.put<IBoard>(`${BASE_URL}/${boardId}`, boardData);
    return response.data;
};

/**
 * Deletes a board by its ID.
 * Requires authentication.
 * @param {string} boardId - The ID of the board to delete.
 * @returns {Promise<void>} A promise that resolves when the board is deleted.
 */
export const deleteBoard = async (boardId: string): Promise<void> => {
    // Assuming the backend returns a 200/204 status on successful deletion with no body,
    // or maybe a confirmation message. Adjust based on actual backend response.
    await axiosInstance.delete(`${BASE_URL}/${boardId}`);
};
