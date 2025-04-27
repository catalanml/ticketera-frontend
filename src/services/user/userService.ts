import axiosInstance from '../axiosConfig'; // Correct: Use default import
import { IUser } from '../../types'; // Revert path back to directory

/**
 * Fetches all registered users from the API.
 * Requires authentication.
 * @returns {Promise<IUser[]>} A promise that resolves to an array of users.
 */
export const fetchUsers = async (): Promise<IUser[]> => {
    try {
        const response = await axiosInstance.get<IUser[]>('/auth/users');
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error);
        // Re-throw the error to be handled by the calling component
        throw error;
    }
};
