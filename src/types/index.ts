export interface ICategory {
    _id: string;
    name: string;
}

export interface IUser {
    _id: string;
    name: string;
    email?: string;
    createdAt?: string;
    updatedAt?: string;
    __v?: number;
}

export enum TaskStatusEnum {
    ToDo = 'To Do',
    InProgress = 'In Progress',
    Done = 'Done',
}

// --- Status/Column Type ---
export interface IStatus {
    _id: string;
    name: string;
    order: number; // Added for column ordering
    boardId: string; // Added board reference
    // Add other relevant fields if needed, e.g., order, boardId
}

// --- Task Types ---
export interface ITask {
    _id: string;
    title: string;
    description?: string;
    status: TaskStatusEnum | string; // Use enum or allow string for flexibility
    boardId: string; // ID of the board this task belongs to
    order: number; // Added for task ordering within a status/column
    // Add other relevant fields like assignee, priority, dueDate, etc.
    // assignee?: IUser | string;
    priority?: 'Low' | 'Medium' | 'High' | 'baja' | 'media' | 'alta'; // Uncommented and added mock values
    // dueDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

// Type for creating a new task (omits _id, boardId, timestamps)
// boardId will likely be provided separately or via context
export type CreateTaskDTO = Omit<ITask, '_id' | 'boardId' | 'createdAt' | 'updatedAt'>;

// Type for updating a task (all fields optional)
export type UpdateTaskDTO = Partial<Omit<ITask, '_id' | 'boardId' | 'createdAt' | 'updatedAt'> & { boardId?: string }>; // Allow updating boardId if needed

// --- Board Types ---
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
