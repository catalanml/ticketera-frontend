export interface ICategory {
    _id: string;
    name: string;
}

export interface IUser {
    _id: string;
    name: string;
    email?: string;
    // Remove backend-specific fields if not needed directly in frontend interfaces often
    // createdAt?: string;
    // updatedAt?: string;
    // __v?: number;
}

export enum TaskStatusEnum {
    ToDo = 'To Do', // Keep frontend-friendly values if needed
    InProgress = 'In Progress',
    Done = 'Done',
    // Add other statuses if your backend enum differs and requires mapping
}

// --- Status/Column Type ---
// Keep IStatus as is if it represents columns in your frontend Kanban board
export interface IStatus {
    _id: string;
    name: string;
    order: number;
    boardId: string;
}


// --- Task Types ---
// Align ITask with the Mongoose model structure
export interface ITask {
    _id: string;
    title: string;
    description?: string;
    // Use the backend enum values if they differ from TaskStatusEnum and map if necessary
    // For now, assume TaskStatusEnum matches backend or mapping happens elsewhere
    status: TaskStatusEnum | string; // Allow string for flexibility if needed
    priority: 'Low' | 'Medium' | 'High'; // Match backend enum
    dueDate?: string; // Use string for date handling in forms, convert as needed
    category?: ICategory | string; // Can be populated object or just ID string
    assignedTo?: IUser | string; // Can be populated object or just ID string
    createdBy: IUser | string; // Can be populated object or just ID string
    boardId: string; // Renamed from 'board' in Mongoose model for clarity if needed, or keep as 'board'
    order: number; // Add order property back for DnD sorting
    createdAt?: string;
    updatedAt?: string;
}

// Type for creating a new task (omits _id, createdBy, createdAt, updatedAt)
// boardId is handled separately by the service function
export type CreateTaskDTO = {
    title: string;
    description?: string;
    status: TaskStatusEnum | string; // Match ITask status type
    priority: 'Low' | 'Medium' | 'High';
    dueDate?: string | null; // Allow null for optional dates
    category?: string | null; // Send only the ID string or null
    assignedTo?: string | null; // Send only the ID string or null
    // createdBy is set by the backend
    // boardId is added by the service function
};


// Type for updating a task (all fields optional, omits _id, createdBy, createdAt, updatedAt)
export type UpdateTaskDTO = Partial<Omit<ITask, '_id' | 'createdBy' | 'createdAt' | 'updatedAt'>>;


// --- Board Types ---
// Keep IBoard as is
export interface IBoard {
    _id: string;
    name: string;
    description?: string; // Optional description
    createdBy: IUser | string; // Can be populated IUser or just the ID string
    tasks?: unknown[]; // Use unknown[] instead of any[] until ITask is defined
    createdAt?: string;
    updatedAt?: string;
}

// Type for creating a new board (omits _id, createdBy, timestamps)
export type CreateBoardDTO = Omit<IBoard, '_id' | 'createdBy' | 'tasks' | 'createdAt' | 'updatedAt'>;

// Type for updating a board (all fields optional)
export type UpdateBoardDTO = Partial<CreateBoardDTO>;
