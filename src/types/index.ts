export type Id = string | number;

export type Priority = 'low' | 'medium' | 'high';

export type Workspace = {
    id: Id;
    name: string;
    icon?: string;
};

export type Note = {
    id: Id;
    workspaceId: Id;
    title: string;
    content: string;
    createdAt: Date | string;
    updatedAt: Date | string;
};

export type LinkGroup = {
    id: Id;
    workspaceId: Id;
    title: string;
};

export type LinkItem = {
    id: Id;
    groupId: Id;
    workspaceId: Id;
    title: string;
    url: string;
    icon?: string;
    username?: string;
    encryptedPassword?: string;
};

export type Tag = {
    id: string;
    name: string;
    color: string;
};

export type Subtask = {
    id: string;
    title: string;
    isCompleted: boolean;
};

export type ActivityLog = {
    id: string;
    action: string;
    timestamp: Date | string;
};

export type Task = {
    id: Id;
    columnId: Id;
    content: string;
    description?: string;
    priority?: Priority;
    tags?: Tag[];
    subtasks?: Subtask[];
    activities?: ActivityLog[];
    dueDate?: Date | string;
    createdAt: Date | string;
    workspaceId: Id;
};

export type Column = {
    id: Id;
    title: string;
};

export type BoardState = {
    tasks: Task[];
    columns: Column[];
};

export type AppSettings = {
    theme: 'light' | 'dark' | 'system';
    fontFamily: string;
};
