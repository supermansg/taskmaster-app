import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Column, Id, Task, AppSettings, Workspace, Note, LinkGroup, LinkItem } from '../types';

interface TaskStore {
    tasks: Task[];
    columns: Column[];
    settings: AppSettings;
    workspaces: Workspace[];
    activeWorkspaceId: Id;
    notes: Note[];
    linkGroups: LinkGroup[];
    links: LinkItem[];
    masterPassword: string | null;
    setMasterPassword: (pwd: string | null) => void;
    setTasks: (tasks: Task[]) => void;
    addTask: (task: Omit<Task, 'workspaceId'>) => void;
    updateTask: (taskId: Id, updates: Partial<Task>) => void;
    deleteTask: (taskId: Id) => void;
    setSettings: (settings: Partial<AppSettings>) => void;
    addWorkspace: (workspace: Workspace) => void;
    setActiveWorkspace: (id: Id) => void;
    deleteWorkspace: (id: Id) => void;
    addColumn: (title: string) => void;
    updateColumn: (id: Id, title: string) => void;
    deleteColumn: (id: Id) => void;
    addNote: (note: Omit<Note, 'workspaceId'>) => void;
    updateNote: (id: Id, updates: Partial<Note>) => void;
    deleteNote: (id: Id) => void;
    addLinkGroup: (title: string) => void;
    updateLinkGroup: (id: Id, title: string) => void;
    deleteLinkGroup: (id: Id) => void;
    addLink: (link: Omit<LinkItem, 'workspaceId'>) => void;
    updateLink: (id: Id, updates: Partial<LinkItem>) => void;
    deleteLink: (id: Id) => void;
    setLinks: (links: LinkItem[]) => void;
}

const initialColumns: Column[] = [
    { id: 'todo', title: 'לביצוע' },
    { id: 'in_progress', title: 'בתהליך' },
    { id: 'done', title: 'הושלם' },
];

export const useTaskStore = create<TaskStore>()(
    persist(
        (set) => ({
            tasks: [],
            columns: initialColumns,
            settings: {
                theme: 'system',
                fontFamily: 'Heebo, sans-serif',
            },
            workspaces: [
                { id: 'default', name: 'לוח ראשי' }
            ],
            activeWorkspaceId: 'default',
            notes: [],
            linkGroups: [{ id: 'lg-general', title: 'כללי', workspaceId: 'default' }],
            links: [],
            masterPassword: null,
            setMasterPassword: (pwd) => set({ masterPassword: pwd }),
            setTasks: (tasks) => set({ tasks }),
            addTask: (task) =>
                set((state) => ({
                    tasks: [...state.tasks, {
                        ...task,
                        workspaceId: state.activeWorkspaceId,
                        activities: [{ id: `act-${Date.now()}`, action: 'יצר את המשימה', timestamp: new Date().toISOString() }]
                    }]
                })),
            updateTask: (taskId, updates) =>
                set((state) => ({
                    tasks: state.tasks.map((t) => {
                        if (t.id !== taskId) return t;

                        let newActivities = t.activities || [];
                        if (updates.columnId && updates.columnId !== t.columnId) {
                            const destColumn = state.columns.find(c => c.id === updates.columnId)?.title || 'עמודה אחרת';
                            newActivities = [
                                ...newActivities,
                                { id: `act-${Date.now()}`, action: `העביר ל${destColumn}`, timestamp: new Date().toISOString() }
                            ];
                        }
                        return { ...t, ...updates, activities: newActivities };
                    }),
                })),
            deleteTask: (taskId) =>
                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== taskId),
                })),
            setSettings: (settingsUpdates) =>
                set((state) => ({
                    settings: { ...state.settings, ...settingsUpdates },
                })),
            addWorkspace: (workspace) =>
                set((state) => ({
                    workspaces: [...state.workspaces, workspace],
                    activeWorkspaceId: workspace.id,
                })),
            setActiveWorkspace: (id) =>
                set({ activeWorkspaceId: id }),
            deleteWorkspace: (id) =>
                set((state) => {
                    const remaining = state.workspaces.filter(w => w.id !== id);
                    return {
                        workspaces: remaining,
                        activeWorkspaceId: state.activeWorkspaceId === id ? remaining[0]?.id || '' : state.activeWorkspaceId,
                        tasks: state.tasks.filter(t => t.workspaceId !== id)
                    };
                }),
            addColumn: (title) =>
                set((state) => ({
                    columns: [...state.columns, { id: `col-${Date.now()}`, title }],
                })),
            updateColumn: (id, title) =>
                set((state) => ({
                    columns: state.columns.map(c => c.id === id ? { ...c, title } : c),
                })),
            deleteColumn: (id) =>
                set((state) => ({
                    columns: state.columns.filter(c => c.id !== id),
                    tasks: state.tasks.filter(t => t.columnId !== id),
                })),
            addNote: (note) =>
                set((state) => ({
                    notes: [{ ...note, workspaceId: state.activeWorkspaceId }, ...state.notes],
                })),
            updateNote: (id, updates) =>
                set((state) => ({
                    notes: state.notes.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n),
                })),
            deleteNote: (id) =>
                set((state) => ({
                    notes: state.notes.filter(n => n.id !== id),
                })),
            addLinkGroup: (title) =>
                set((state) => ({
                    linkGroups: [...state.linkGroups, { id: `lg-${Date.now()}`, title, workspaceId: state.activeWorkspaceId }],
                })),
            updateLinkGroup: (id, title) =>
                set((state) => ({
                    linkGroups: state.linkGroups.map(lg => lg.id === id ? { ...lg, title } : lg),
                })),
            deleteLinkGroup: (id) =>
                set((state) => ({
                    linkGroups: state.linkGroups.filter(lg => lg.id !== id),
                    links: state.links.filter(l => l.groupId !== id),
                })),
            addLink: (link) =>
                set((state) => ({
                    links: [...state.links, { ...link, workspaceId: state.activeWorkspaceId }],
                })),
            updateLink: (id, updates) =>
                set((state) => ({
                    links: state.links.map(l => l.id === id ? { ...l, ...updates } : l),
                })),
            deleteLink: (id) =>
                set((state) => ({
                    links: state.links.filter(l => l.id !== id),
                })),
            setLinks: (links) => set({ links }),
        }),
        {
            name: 'taskmaster-storage',
            partialize: (state) => Object.fromEntries(
                Object.entries(state).filter(([key]) => !['masterPassword'].includes(key))
            ) as unknown as TaskStore,
        }
    )
);
