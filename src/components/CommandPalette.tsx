import { useState, useEffect, useRef } from 'react';
import { Search, Command, CheckSquare, Settings, Briefcase } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import type { Task } from '../types';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (view: 'board' | 'calendar' | 'settings') => void;
    onTaskSelect: (task: Task) => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate, onTaskSelect }: CommandPaletteProps) {
    const { tasks, workspaces, setActiveWorkspace, activeWorkspaceId } = useTaskStore();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery('');
        }
    }, [isOpen]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (isOpen) onClose();
            }
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const filteredTasks = query
        ? tasks.filter(t => t.content.toLowerCase().includes(query.toLowerCase()) ||
            t.description?.toLowerCase().includes(query.toLowerCase()))
        : [];

    const filteredWorkspaces = query
        ? workspaces.filter(w => w.name.toLowerCase().includes(query.toLowerCase()))
        : workspaces;

    const navigateToWorkspace = (workspaceId: string | number) => {
        setActiveWorkspace(workspaceId);
        onNavigate('board');
        onClose();
    };

    const handleTaskClick = (task: Task) => {
        if (task.workspaceId !== activeWorkspaceId) {
            setActiveWorkspace(task.workspaceId);
        }
        onNavigate('board');
        onClose();
        setTimeout(() => onTaskSelect(task), 100);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-200">

                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 dark:border-slate-800">
                    <Search className="text-slate-400" size={20} />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent text-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
                        placeholder="חפש משימות, לוחות, או הקלד פקודה..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <div className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                        <Command size={12} />
                        <span>K</span>
                    </div>
                </div>

                {/* Results */}
                <div className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">

                    {/* Default Suggestions (when query is empty) */}
                    {!query && (
                        <div className="mb-4">
                            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">ניווט מהיר</h3>
                            <div className="space-y-1">
                                <button
                                    onClick={() => { onNavigate('settings'); onClose(); }}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                >
                                    <Settings size={18} />
                                    <span className="font-medium">פתח הגדרות מערכת</span>
                                </button>
                            </div>

                            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">סביבות עבודה</h3>
                            <div className="space-y-1">
                                {workspaces.map(ws => (
                                    <button
                                        key={ws.id}
                                        onClick={() => navigateToWorkspace(ws.id)}
                                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Briefcase size={18} />
                                            <span className="font-medium">{ws.name}</span>
                                        </div>
                                        {activeWorkspaceId === ws.id && (
                                            <span className="text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-0.5 rounded-md font-bold">פעיל</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Search Results */}
                    {query && (
                        <div className="space-y-4">
                            {filteredWorkspaces.length > 0 && (
                                <div>
                                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">סביבות עבודה</h3>
                                    <div className="space-y-1">
                                        {filteredWorkspaces.map(ws => (
                                            <button
                                                key={ws.id}
                                                onClick={() => navigateToWorkspace(ws.id)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 transition-colors"
                                            >
                                                <Briefcase size={18} />
                                                <span className="font-medium">{ws.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filteredTasks.length > 0 && (
                                <div>
                                    <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-4">משימות ({filteredTasks.length})</h3>
                                    <div className="space-y-1">
                                        {filteredTasks.map(task => (
                                            <button
                                                key={task.id}
                                                onClick={() => handleTaskClick(task)}
                                                className="w-full flex flex-col items-start px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors text-right"
                                            >
                                                <div className="flex items-center gap-3 w-full">
                                                    <CheckSquare size={16} className="text-slate-400 group-hover:text-blue-500" />
                                                    <span className="font-medium text-slate-800 dark:text-slate-100 truncate">{task.content}</span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 px-7 text-[10px] text-slate-500">
                                                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                                        {workspaces.find(w => w.id === task.workspaceId)?.name || 'לוח לא ידוע'}
                                                    </span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {filteredTasks.length === 0 && filteredWorkspaces.length === 0 && (
                                <div className="py-12 text-center text-slate-500">
                                    לא נמצאו תוצאות לחיפוש "{query}"
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer shortcuts */}
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4 text-xs tracking-wide text-slate-500">
                    <div className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm">Enter</kbd> בחירה</div>
                    <div className="flex items-center gap-1.5"><kbd className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-sm">Esc</kbd> יציאה</div>
                </div>
            </div>
        </div>
    );
}
