// filepath: /home/lcatalan/projects/ticketera-frontend/src/hooks/useTaskFormData.tsx
import { useState, useEffect } from 'react';
import { AxiosError } from 'axios';
import { ICategory, IUser, IBoard } from '../types';
import { fetchCategories } from '../services/category/categoryService';
import { fetchUsers } from '../services/user/userService';
import { fetchBoards } from '../services/board/boardService';
import { useAuth } from './useAuth';

interface UseTaskFormDataResult {
    categories: ICategory[];
    isLoadingCategories: boolean;
    errorCategories: string | null;
    users: IUser[];
    isLoadingUsers: boolean;
    errorUsers: string | null;
    boards: IBoard[];
    isLoadingBoards: boolean;
    errorBoards: string | null;
}

export const useTaskFormData = (showBoardSelector: boolean): UseTaskFormDataResult => {
    const { isAuthenticated } = useAuth();

    const [categories, setCategories] = useState<ICategory[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);

    const [users, setUsers] = useState<IUser[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(true);
    const [errorUsers, setErrorUsers] = useState<string | null>(null);

    const [boards, setBoards] = useState<IBoard[]>([]);
    const [isLoadingBoards, setIsLoadingBoards] = useState(false); // Only load if needed
    const [errorBoards, setErrorBoards] = useState<string | null>(null);

    // Fetch categories effect
    useEffect(() => {
        const loadCategories = async () => {
            setIsLoadingCategories(true);
            setErrorCategories(null);
            try {
                const fetchedCategories = await fetchCategories();
                setCategories(fetchedCategories);
            } catch (error) {
                console.error('Failed to load categories:', error);
                if (error instanceof AxiosError && error.response?.status === 401) {
                    setErrorCategories('Authentication error. Please log in again.');
                } else {
                    setErrorCategories('Failed to load categories. Please try again.');
                }
            } finally {
                setIsLoadingCategories(false);
            }
        };

        if (isAuthenticated) {
            loadCategories();
        } else {
            setCategories([]);
            setIsLoadingCategories(false);
        }
    }, [isAuthenticated]);

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

        if (isAuthenticated) {
            loadUsers();
        } else {
            setUsers([]);
            setIsLoadingUsers(false);
        }
    }, [isAuthenticated]);

    // Fetch boards effect (conditional)
    useEffect(() => {
        const loadBoards = async () => {
            setIsLoadingBoards(true);
            setErrorBoards(null);
            try {
                const fetchedBoards = await fetchBoards();
                setBoards(fetchedBoards);
            } catch (error) {
                console.error('Failed to load boards:', error);
                if (error instanceof AxiosError && error.response?.status === 401) {
                    setErrorBoards('Authentication error fetching boards.');
                } else {
                    setErrorBoards('Failed to load boards.');
                }
            } finally {
                setIsLoadingBoards(false);
            }
        };

        if (showBoardSelector && isAuthenticated) {
            loadBoards();
        } else if (!isAuthenticated) {
            setBoards([]);
            setIsLoadingBoards(false);
        }
        // If showBoardSelector is false, we don't need to load boards,
        // so isLoadingBoards remains false by default.
    }, [showBoardSelector, isAuthenticated]);

    return {
        categories,
        isLoadingCategories,
        errorCategories,
        users,
        isLoadingUsers,
        errorUsers,
        boards,
        isLoadingBoards,
        errorBoards,
    };
};
