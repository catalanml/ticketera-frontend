// /home/lcatalan/projects/ticketera-frontend/src/context/AuthProvider.tsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AuthContext } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Initialize state based on the presence of the 'token' in localStorage
    // This is generally more robust than relying on a separate 'isAuthenticated' flag
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return !!localStorage.getItem('token'); // Check if token exists
    });

    // Define the logout function
    const logout = useCallback(() => {
        console.log("Executing logout");
        localStorage.removeItem('token');           // Remove the session token
        localStorage.removeItem('isAuthenticated'); // Remove the old flag just in case
        setIsAuthenticated(false);                  // Update the state
        // Navigation should be handled by the component calling logout (e.g., Sidebar)
        // or by the route protection logic in App.tsx
    }, []); // useCallback ensures the function identity is stable

    // Optional but recommended: Listen for storage changes (e.g., logout in another tab)
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            // If the token is removed in another tab, log out here too
            if (event.key === 'token' && event.newValue === null) {
                console.log('Token removed via storage event, logging out.');
                setIsAuthenticated(false);
            }
            // If the old 'isAuthenticated' flag is removed (less likely needed now)
            if (event.key === 'isAuthenticated' && event.newValue === null && !localStorage.getItem('token')) {
                console.log('isAuthenticated flag removed via storage event, logging out.');
                setIsAuthenticated(false);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Cleanup listener on component unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // Empty dependency array ensures this runs once on mount

    // Memoize the context value to optimize performance
    const contextValue = useMemo(() => ({
        isAuthenticated,
        setIsAuthenticated, // Keep this so Login.tsx can set state after successful login
        logout
    }), [isAuthenticated, logout]); // Include logout in dependencies

    // Note: We removed the useEffect that *saved* isAuthenticated to localStorage.
    // The source of truth for being authenticated is now primarily the presence
    // of the 'token'. The `isAuthenticated` state reflects this.

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};