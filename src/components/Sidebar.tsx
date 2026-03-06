import { Home, CalendarDays, Settings, ListTodo, LogOut, Briefcase, Plus, FileText } from 'lucide-react';
import { cn } from '../utils';
import { useTaskStore } from '../store/useTaskStore';

interface SidebarProps {
    currentView: 'board' | 'calendar' | 'settings' | 'notes' | 'links';
    onChangeView: (view: 'board' | 'calendar' | 'settings' | 'notes' | 'links') => void;
}

export function Sidebar({ currentView, onChangeView }: SidebarProps) {
    const { tasks, workspaces, activeWorkspaceId, setActiveWorkspace, addWorkspace } = useTaskStore();
    const workspaceTasks = tasks.filter(t => t.workspaceId === activeWorkspaceId);

    const handleAddWorkspace = () => {
        const name = prompt('שם לוח חדש:');
        if (name?.trim()) {
            addWorkspace({ id: `ws-${Date.now()}`, name });
        }
    };

    const navItems = [
        { id: 'board', label: 'לוח משימות מרכזי', icon: Home },
        { id: 'notes', label: 'פתקים וסיכומים', icon: FileText },
        { id: 'links', label: 'לינקים ומשאבים', icon: Briefcase },
        { id: 'calendar', label: 'לוח שנה (בקרוב)', icon: CalendarDays },
        { id: 'settings', label: 'הגדרות מתקדמות', icon: Settings },
    ] as const;

    return (
        <aside className="w-64 flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 transition-colors duration-200">
            <div className="flex-1 px-4 py-8 space-y-8">
                {/* Navigation */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-3">
                        תצוגות
                    </h2>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onChangeView(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                    currentView === item.id
                                        ? "bg-blue-50 text-blue-600 dark:bg-blue-600/10 dark:text-blue-400 font-semibold"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={18} className={currentView === item.id ? "text-blue-600 dark:text-blue-400" : "text-slate-400"} />
                                    <span className="text-sm">{item.label}</span>
                                </div>
                                {item.id === 'board' && (
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                        currentView === item.id
                                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                            : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                                    )}>
                                        {workspaceTasks.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Workspaces */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between mb-4 px-3 mt-8">
                        <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                            סביבות עבודה
                        </h2>
                        <button
                            onClick={handleAddWorkspace}
                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <nav className="space-y-1">
                        {workspaces.map((ws) => (
                            <button
                                key={ws.id}
                                onClick={() => {
                                    setActiveWorkspace(ws.id);
                                    if (currentView !== 'board') onChangeView('board');
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                                    activeWorkspaceId === ws.id
                                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 font-medium border border-indigo-100 dark:border-indigo-500/20"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <Briefcase size={16} className={activeWorkspaceId === ws.id ? "text-indigo-500" : "text-slate-400"} />
                                {ws.name}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Quick Stats overview */}
                <div className="space-y-2">
                    <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 px-3 mt-8">
                        סקירה מהירה
                    </h2>
                    <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3 mb-3 text-slate-700 dark:text-slate-300">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <ListTodo size={16} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {workspaceTasks.filter(t => t.columnId === 'done').length} הושלמו
                                </p>
                                <p className="text-xs text-slate-500">מתוך {workspaceTasks.length} משימות בלוח</p>
                            </div>
                        </div>

                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${workspaceTasks.length > 0 ? (workspaceTasks.filter(t => t.columnId === 'done').length / workspaceTasks.length) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button className="flex items-center gap-3 w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
                    <LogOut size={18} />
                    התנתקות
                </button>
            </div>
        </aside>
    );
}
