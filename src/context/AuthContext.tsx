
import { createContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void; // Still needed for Login component to update state
  logout: () => void; // <-- Add the logout function signature
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => { }, // Default empty function
  logout: () => { }, // <-- Add default empty function for logout
});