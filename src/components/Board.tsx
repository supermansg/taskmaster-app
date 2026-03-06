import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import type { Id, Task } from '../types';
import { cn } from '../utils';
import { GripVertical, Plus, Trash2, Calendar, Tag as TagIcon, AlignLeft, CheckSquare } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface BoardProps {
    onTaskClick: (task: Task) => void;
}

export function Board({ onTaskClick }: BoardProps) {
    const { tasks, columns, addTask, deleteTask, setTasks, activeWorkspaceId, addColumn, updateColumn, deleteColumn } = useTaskStore();
    const workspaceTasks = tasks.filter(t => t.workspaceId === activeWorkspaceId);
    const [newTaskContent, setNewTaskContent] = useState('');
    const [activeColumn, setActiveColumn] = useState<Id | null>(null);
    const [isAddingColumn, setIsAddingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [editingColumnId, setEditingColumnId] = useState<Id | null>(null);
    const [editingColumnTitle, setEditingColumnTitle] = useState('');

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColumnId = source.droppableId;
        const destColumnId = destination.droppableId;

        if (sourceColumnId === destColumnId) {
            const columnTasks = workspaceTasks.filter((t) => t.columnId === sourceColumnId);
            const [reorderedItem] = columnTasks.splice(source.index, 1);
            columnTasks.splice(destination.index, 0, reorderedItem);

            const otherTasks = workspaceTasks.filter((t) => t.columnId !== sourceColumnId);
            const otherWorkspacesTasks = tasks.filter(t => t.workspaceId !== activeWorkspaceId);
            setTasks([...otherWorkspacesTasks, ...otherTasks, ...columnTasks]);
        } else {
            const sourceColumnTasks = workspaceTasks.filter((t) => t.columnId === sourceColumnId);
            const destColumnTasks = workspaceTasks.filter((t) => t.columnId === destColumnId);

            const [draggedTask] = sourceColumnTasks.splice(source.index, 1);
            if (!draggedTask) return;

            const updatedTask = { ...draggedTask, columnId: destColumnId };
            destColumnTasks.splice(destination.index, 0, updatedTask);

            const otherTasks = workspaceTasks.filter((t) => t.columnId !== sourceColumnId && t.columnId !== destColumnId);
            const otherWorkspacesTasks = tasks.filter(t => t.workspaceId !== activeWorkspaceId);

            setTasks([...otherWorkspacesTasks, ...otherTasks, ...sourceColumnTasks, ...destColumnTasks]);
        }
    };

    const handleAddTask = (columnId: Id) => {
        if (!newTaskContent.trim()) return;
        const newTask: Omit<Task, 'workspaceId'> = {
            id: `t-${Date.now()}`,
            columnId,
            content: newTaskContent,
            createdAt: new Date().toISOString(),
        };
        addTask(newTask);
        setNewTaskContent('');
        setActiveColumn(null);
    };

    const handleAddColumn = () => {
        if (!newColumnTitle.trim()) return;
        addColumn(newColumnTitle);
        setNewColumnTitle('');
        setIsAddingColumn(false);
    };

    const handleUpdateColumn = (colId: Id) => {
        if (!editingColumnTitle.trim()) return;
        updateColumn(colId, editingColumnTitle);
        setEditingColumnId(null);
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-4 h-full scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                {columns.map((col) => (
                    <div key={col.id} className="flex flex-col gap-4 bg-slate-100 dark:bg-slate-800/60 p-4 rounded-2xl min-w-[340px] max-w-[340px] shadow-sm backdrop-blur-xl border border-white/40 dark:border-white/5">
                        <div className="flex justify-between items-center px-1 mb-2 group/col-header">
                            {editingColumnId === col.id ? (
                                <input
                                    autoFocus
                                    className="font-bold text-lg text-slate-800 dark:text-slate-100 bg-transparent border-b border-blue-500 focus:outline-none w-full mr-2"
                                    value={editingColumnTitle}
                                    onChange={(e) => setEditingColumnTitle(e.target.value)}
                                    onBlur={() => handleUpdateColumn(col.id)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdateColumn(col.id)}
                                />
                            ) : (
                                <h3
                                    className="font-bold text-lg text-slate-800 dark:text-slate-100 cursor-text flex-1"
                                    onClick={() => { setEditingColumnId(col.id); setEditingColumnTitle(col.title); }}
                                >
                                    {col.title}
                                </h3>
                            )}
                            <div className="flex items-center gap-2">
                                <span className="bg-white/80 dark:bg-slate-700/80 text-slate-500 dark:text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                                    {workspaceTasks.filter((t) => t.columnId === col.id).length}
                                </span>
                                <button
                                    onClick={() => { if (confirm('האם למחוק עמודה זו ואת כל משימותיה?')) deleteColumn(col.id) }}
                                    className="opacity-0 group-hover/col-header:opacity-100 text-rose-400 hover:text-rose-600 p-1 rounded transition-opacity"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>

                        <Droppable droppableId={String(col.id)}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={cn(
                                        "flex-1 min-h-[150px] flex flex-col gap-3 transition-colors duration-200 rounded-xl",
                                        snapshot.isDraggingOver ? "bg-slate-200/50 dark:bg-slate-700/40" : ""
                                    )}
                                >
                                    {workspaceTasks.filter((task) => task.columnId === col.id).map((task, index) => (
                                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    onClick={() => onTaskClick(task)}
                                                    className={cn(
                                                        "group relative bg-white dark:bg-slate-800/90 p-4 rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500",
                                                        snapshot.isDragging ? "shadow-xl scale-[1.04] rotate-2 ring-2 ring-blue-500/50 z-50 cursor-grabbing" : ""
                                                    )}
                                                >
                                                    <div {...provided.dragHandleProps} className="absolute top-3 left-2 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-500 dark:hover:text-slate-300 transition-opacity cursor-grab active:cursor-grabbing px-2 py-1" onClick={(e) => e.stopPropagation()}>
                                                        <GripVertical size={16} />
                                                    </div>

                                                    <div className="flex items-start justify-between mb-2">
                                                        {task.priority && (
                                                            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider", task.priority === 'high' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' : task.priority === 'medium' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400')}>
                                                                {task.priority}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="text-slate-800 dark:text-slate-100 font-medium whitespace-pre-wrap leading-relaxed">
                                                        {task.content}
                                                    </p>

                                                    <div className="flex items-center gap-3 mt-4 text-slate-400 dark:text-slate-500">
                                                        {task.dueDate && (
                                                            <div className="flex items-center gap-1 text-[11px] font-medium bg-slate-50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded text-indigo-500 dark:text-indigo-400">
                                                                <Calendar size={12} />
                                                                <span>{format(new Date(task.dueDate), 'd MMM', { locale: he })}</span>
                                                            </div>
                                                        )}
                                                        {task.description && <AlignLeft size={14} />}
                                                        {task.subtasks && task.subtasks.length > 0 && (
                                                            <div className={cn(
                                                                "flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded",
                                                                task.subtasks.filter(s => s.isCompleted).length === task.subtasks.length
                                                                    ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                                                    : "bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400"
                                                            )}>
                                                                <CheckSquare size={12} />
                                                                <span>{task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length}</span>
                                                            </div>
                                                        )}
                                                        {task.tags && task.tags.length > 0 && (
                                                            <div className="flex items-center gap-1">
                                                                <TagIcon size={12} />
                                                                <span className="text-[11px]">{task.tags.length}</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); deleteTask(task.id); }}
                                                        className="absolute bottom-3 left-3 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        <div className="mt-2 text-right">
                            {activeColumn === col.id ? (
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <textarea
                                        autoFocus
                                        placeholder="מה יש לעשות?"
                                        className="w-full bg-transparent text-sm resize-none focus:outline-none dark:text-white"
                                        rows={2}
                                        value={newTaskContent}
                                        onChange={(e) => setNewTaskContent(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddTask(col.id);
                                            }
                                        }}
                                    />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button className="text-xs font-semibold px-3 py-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition" onClick={() => { setActiveColumn(null); setNewTaskContent(''); }}>ביטול</button>
                                        <button className="text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition" onClick={() => handleAddTask(col.id)}>הוספה</button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    className="flex items-center justify-center gap-2 w-full text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 py-2.5 rounded-xl transition-all"
                                    onClick={() => setActiveColumn(col.id)}
                                >
                                    <Plus size={18} /> הוסף כרטיסייה
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add Column Button */}
                <div className="min-w-[340px] max-w-[340px] h-fit">
                    {isAddingColumn ? (
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
                            <input
                                autoFocus
                                placeholder="שם העמודה..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:outline-none focus:border-blue-500 dark:text-white mb-3"
                                value={newColumnTitle}
                                onChange={(e) => setNewColumnTitle(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                            />
                            <div className="flex justify-end gap-2">
                                <button className="text-sm font-medium px-4 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition" onClick={() => { setIsAddingColumn(false); setNewColumnTitle(''); }}>ביטול</button>
                                <button className="text-sm font-medium px-4 py-1.5 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition" onClick={handleAddColumn}>הוסף</button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setIsAddingColumn(true)}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 hover:text-slate-600 dark:hover:border-slate-500 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all font-medium"
                        >
                            <Plus size={20} /> הוסף עמודה חדשה
                        </button>
                    )}
                </div>
            </div>
        </DragDropContext>
    );
}
