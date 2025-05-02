// File: /home/lcatalan/projects/ticketera-frontend/src/context/BoardContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

// Types for registry entries
type CardEntry = { element: HTMLElement }; // Add more fields if needed (e.g., actionMenuTrigger)
type ColumnEntry = { element: HTMLElement };

// Registry structure
type CardRegistryAPI = {
    register: (cardId: string, entry: CardEntry) => () => void;
    getCard: (cardId: string) => CardEntry | null;
};

type ColumnRegistryAPI = {
    register: (columnId: string, entry: ColumnEntry) => () => void;
    getColumn: (columnId: string) => ColumnEntry | null;
};

type BoardRegistry = {
    cardRegistry: CardRegistryAPI; // Use the API type here
    columnRegistry: ColumnRegistryAPI; // Use the API type here
};

// Function to create a registry instance
export function createRegistry(): BoardRegistry {
    const cardMap = new Map<string, CardEntry>(); // Renamed variable
    const columnMap = new Map<string, ColumnEntry>(); // Renamed variable

    const cardRegistryAPI: CardRegistryAPI = {
        register: (cardId, entry) => {
            cardMap.set(cardId, entry);
            return () => cardMap.delete(cardId);
        },
        getCard: (cardId) => cardMap.get(cardId) ?? null,
    };

    const columnRegistryAPI: ColumnRegistryAPI = {
        register: (columnId, entry) => {
            columnMap.set(columnId, entry);
            return () => columnMap.delete(columnId);
        },
        getColumn: (columnId) => columnMap.get(columnId) ?? null,
    };

    return {
        cardRegistry: cardRegistryAPI,
        columnRegistry: columnRegistryAPI,
    };
}


// Define the shape of the context value
export interface BoardContextValue {
    // State update functions (adjust arguments as needed)
    reorderCard: (args: {
        columnId: string;
        startIndex: number;
        finishIndex: number;
        trigger?: 'pointer' | 'keyboard';
    }) => void;
    moveCard: (args: {
        startColumnId: string;
        finishColumnId: string;
        itemIndexInStartColumn: number;
        itemIndexInFinishColumn?: number;
        trigger?: 'pointer' | 'keyboard';
    }) => void;
    // Registry functions
    registerCard: CardRegistryAPI['register']; // Corrected type reference
    registerColumn: ColumnRegistryAPI['register']; // Corrected type reference
    // Instance ID to scope drag operations
    instanceId: symbol;
}

// Create the context
// Using null! and checking in the hook is a common pattern
const BoardContext = createContext<BoardContextValue | null>(null); // Removed default value

// Create the provider component
interface BoardProviderProps {
    children: ReactNode;
    value: BoardContextValue;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children, value }) => {
    return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

// Create the hook to use the context
export function useBoardContext(): BoardContextValue | null {
    const context = useContext(BoardContext);
    // No longer throws an error, just returns the context value (which might be null)
    return context;
}
