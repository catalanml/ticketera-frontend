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
