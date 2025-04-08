// src/services/authService.ts
import axiosInstance from '../axiosConfig';

interface User {
    _id: string;
    name: string;
    email: string;
}

interface LoginResponse {
    message: string;
    token: string;
    user: User;
}

export const loginRequest = async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', {
        email,
        password,
    });
    return response.data;
};