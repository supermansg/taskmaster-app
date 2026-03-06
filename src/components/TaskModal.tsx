import { useState, useEffect } from 'react';
import { X, AlignLeft, Flag, CheckSquare, Plus, Trash2, Edit2, Eye, History } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Task, Priority, Subtask } from '../types';
import { useTaskStore } from '../store/useTaskStore';
import { cn } from '../utils';

interface TaskModalProps {
    task: Task;
    isOpen: boolean;
    onClose: () => void;
}

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
    const updateTask = useTaskStore((state) => state.updateTask);

    const [content, setContent] = useState(task.content);
    const [description, setDescription] = useState(task.description || '');
    const [priority, setPriority] = useState<Priority | undefined>(task.priority);
    const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    const [subtasks, setSubtasks] = useState<Subtask[]>(task.subtasks || []);
    const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(!!task.description);

    useEffect(() => {
        setContent(task.content);
        setDescription(task.description || '');
        setPriority(task.priority);
        setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
        setSubtasks(task.subtasks || []);
        setNewSubtaskTitle('');
    }, [task]);

    if (!isOpen) return null;

    const handleSave = () => {
        updateTask(task.id, {
            content,
            description,
            priority,
            dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
            subtasks,
        });
        onClose();
    };

    const handleAddSubtask = () => {
        if (!newSubtaskTitle.trim()) return;
        setSubtasks([...subtasks, { id: `st-${Date.now()}`, title: newSubtaskTitle, isCompleted: false }]);
        setNewSubtaskTitle('');
    };

    const toggleSubtask = (subtaskId: string) => {
        setSubtasks(subtasks.map(st => st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st));
    };

    const deleteSubtask = (subtaskId: string) => {
        setSubtasks(subtasks.filter(st => st.id !== subtaskId));
    };

    const completedSubtasks = subtasks.filter(st => st.isCompleted).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" dir="rtl">
            <div
                className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex-1 ml-4">
                        <input
                            type="text"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full text-2xl font-bold bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-300"
                            placeholder="כותרת המשימה..."
                        />
                        <p className="text-sm text-slate-500 mt-1">
                            ברשימה <span className="font-semibold">{useTaskStore.getState().columns.find(c => c.id === task.columnId)?.title}</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        {/* Description */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                                    <AlignLeft size={20} className="text-slate-500" /> תיאור
                                </div>
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                                    <button
                                        onClick={() => setIsPreviewMode(false)}
                                        className={cn("px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors", !isPreviewMode ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                                    >
                                        <Edit2 size={14} /> עריכה
                                    </button>
                                    <button
                                        onClick={() => setIsPreviewMode(true)}
                                        className={cn("px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors", isPreviewMode ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300")}
                                    >
                                        <Eye size={14} /> תצוגה מקדימה
                                    </button>
                                </div>
                            </div>

                            {isPreviewMode ? (
                                <div className="w-full min-h-[120px] p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                                    {description ? (
                                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400 hover:prose-a:text-blue-500">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {description}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <div className="text-slate-400 italic text-sm" onClick={() => setIsPreviewMode(false)}>
                                            אין תיאור למשימה זו. לחץ על עריכה כדי להוסיף.
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    autoFocus
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="הוסף תיאור מפורט... (תומך בכתיבת Markdown כמו **הדגשה**, *נטוי*, [קישורים](url), רשימות ועוד)"
                                    className="w-full min-h-[120px] p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y font-mono text-sm"
                                />
                            )}
                        </div>

                        {/* Checklist */}
                        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                                    <CheckSquare size={20} className="text-slate-500" /> צ'ק-ליסט
                                </div>
                                {subtasks.length > 0 && (
                                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        {completedSubtasks} / {subtasks.length} ({Math.round((completedSubtasks / subtasks.length) * 100)}%)
                                    </div>
                                )}
                            </div>

                            {subtasks.length > 0 && (
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-500"
                                        style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                {subtasks.map((st) => (
                                    <div key={st.id} className="flex items-center group gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                        <input
                                            type="checkbox"
                                            checked={st.isCompleted}
                                            onChange={() => toggleSubtask(st.id)}
                                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/50"
                                        />
                                        <span className={cn(
                                            "flex-1 text-sm transition-all",
                                            st.isCompleted ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-700 dark:text-slate-200"
                                        )}>
                                            {st.title}
                                        </span>
                                        <button
                                            onClick={() => deleteSubtask(st.id)}
                                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="text"
                                    value={newSubtaskTitle}
                                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                    placeholder="הוסף תת-משימה..."
                                    className="flex-1 p-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                                <button
                                    onClick={handleAddSubtask}
                                    disabled={!newSubtaskTitle.trim()}
                                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Sidebar Controls */}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">עדיפות</label>
                            <div className="flex flex-col gap-2">
                                {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(priority === p ? undefined : p)}
                                        className={cn(
                                            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all text-right",
                                            priority === p
                                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                                : "border-slate-200 dark:border-slate-700 hover:bg-slate-50"
                                        )}
                                    >
                                        <Flag size={14} className={
                                            p === 'high' ? 'text-rose-500' : p === 'medium' ? 'text-amber-500' : 'text-emerald-500'
                                        } />
                                        {p === 'high' ? 'דחופה' : p === 'medium' ? 'רגילה' : 'נמוכה'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">תאריך יעד</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full p-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>

                        {/* Activity Log */}
                        {task.activities && task.activities.length > 0 && (
                            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-lg font-semibold text-slate-800 dark:text-slate-200">
                                    <History size={20} className="text-slate-500" /> היסטוריית פעולות
                                </div>
                                <div className="space-y-4 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 pr-2 pb-2">
                                    {[...task.activities].reverse().map((act, idx) => (
                                        <div key={act.id} className="relative pr-6">
                                            {/* Timeline Line */}
                                            {idx !== task.activities!.length - 1 && (
                                                <div className="absolute right-[5px] top-4 bottom-[-24px] w-px bg-slate-200 dark:bg-slate-700" />
                                            )}
                                            {/* Timeline Dot */}
                                            <div className="absolute right-0 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-blue-400 dark:bg-blue-500 shadow-sm" />

                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-none">
                                                {act.action}
                                            </p>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                {new Date(act.timestamp).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                        ביטול
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95">
                        שמירה
                    </button>
                </div>
            </div>
        </div>
    );
}
