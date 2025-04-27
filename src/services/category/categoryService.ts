import apiClient from '../axiosConfig';

// Define the Category type - consider moving this to src/types/ if shared
interface ICategory {
    _id: string;
    name: string;
}

// Define the expected API response structure
interface CategoriesApiResponse {
    message: string;
    categories: ICategory[];
}

/**
 * Fetches all categories from the backend.
 */
export const fetchCategories = async (): Promise<ICategory[]> => {
    try {
        // Assuming your API endpoint for categories is '/api/categories'
        // Adjust the path if it's different.
        const response = await apiClient.get<CategoriesApiResponse>('/categories');
        return response.data.categories;
    } catch (error) {
        console.error('Error fetching categories:', error);
        // Depending on your error handling strategy, you might want to:
        // - Throw the error to be caught by the component
        // - Return an empty array
        // - Return a specific error object
        throw new Error('Failed to fetch categories');
    }
};
