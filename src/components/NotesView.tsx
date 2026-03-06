import { useState } from 'react';
import { Plus, Search, FileText, Trash2, Edit2, Clock, AlignLeft, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTaskStore } from '../store/useTaskStore';
import type { Note } from '../types';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { cn } from '../utils';

export function NotesView() {
    const { notes, activeWorkspaceId, addNote, updateNote, deleteNote } = useTaskStore();
    const workspaceNotes = notes.filter(n => n.workspaceId === activeWorkspaceId);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Editor State
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const filteredNotes = workspaceNotes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCreateNew = () => {
        const newNote: Omit<Note, 'workspaceId'> = {
            id: `note-${Date.now()}`,
            title: 'פתק חדש',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        addNote(newNote);
        // Note gets prepended, so it should be the first one in the filtered list if not searching
    };

    const handleSelectNote = (note: Note) => {
        setSelectedNote(note);
        setIsEditing(false);
        setIsPreviewMode(false);
    };

    const startEditing = () => {
        if (!selectedNote) return;
        setEditTitle(selectedNote.title);
        setEditContent(selectedNote.content);
        setIsEditing(true);
        setIsPreviewMode(false);
    };

    const handleSave = () => {
        if (!selectedNote) return;
        updateNote(selectedNote.id, {
            title: editTitle,
            content: editContent
        });
        setIsEditing(false);
        // Updating selectedNote local state to reflect changes immediately
        setSelectedNote({ ...selectedNote, title: editTitle, content: editContent, updatedAt: new Date().toISOString() });
    };

    const handleDelete = (id: import('../types').Id, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('האם למחוק פתק זה?')) {
            deleteNote(id);
            if (selectedNote?.id === id) {
                setSelectedNote(null);
                setIsEditing(false);
            }
        }
    };

    return (
        <div className="h-full flex gap-6 bg-transparent" dir="rtl">
            {/* Sidebar List */}
            <div className="w-80 flex flex-col bg-white dark:bg-slate-800/80 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                            <FileText className="text-blue-500" size={24} />
                            פתקים וסיכומים
                        </h2>
                    </div>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="חיפוש..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl py-2 pr-9 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                            />
                        </div>
                        <button
                            onClick={handleCreateNew}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl shadow-sm transition-colors"
                            title="פתק חדש"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 p-2 space-y-1">
                    {filteredNotes.length === 0 ? (
                        <div className="text-center p-8 text-slate-400 text-sm">
                            לא נמצאו פתקים.
                        </div>
                    ) : (
                        filteredNotes.map(n => (
                            <div
                                key={n.id}
                                onClick={() => handleSelectNote(n)}
                                className={cn(
                                    "p-3 rounded-xl cursor-pointer transition-all border group relative",
                                    selectedNote?.id === n.id
                                        ? "bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30"
                                        : "bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                )}
                            >
                                <div className="pr-1">
                                    <h3 className={cn(
                                        "font-semibold text-sm truncate pr-4",
                                        selectedNote?.id === n.id ? "text-blue-700 dark:text-blue-400" : "text-slate-700 dark:text-slate-200"
                                    )}>
                                        {n.title || 'ללא כותרת'}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 pr-4">
                                        {n.content || '...'}
                                    </p>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 pr-4">
                                        <Clock size={10} />
                                        <span>{format(new Date(n.updatedAt), 'd MMM HH:mm', { locale: he })}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(n.id, e)}
                                    className="absolute left-2 top-3 p-1.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-800/80 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700/50 backdrop-blur-xl overflow-hidden p-6 relative">
                {selectedNote ? (
                    isEditing ? (
                        <div className="h-full flex flex-col animate-in fade-in duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="text-2xl font-bold bg-transparent border-b-2 border-transparent focus:border-blue-500 focus:outline-none w-1/2 text-slate-800 dark:text-slate-100 px-2 py-1"
                                    placeholder="כותרת הפתק..."
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                                        className={cn("px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-2 transition-colors", isPreviewMode ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400" : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700")}
                                    >
                                        <Eye size={16} /> תצוגה
                                    </button>
                                    <button
                                        onClick={() => { setIsEditing(false); setIsPreviewMode(false); }}
                                        className="px-4 py-2 text-sm font-medium text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                                    >
                                        ביטול
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors blur-sm-hover"
                                    >
                                        שמירה
                                    </button>
                                </div>
                            </div>

                            {isPreviewMode ? (
                                <div className="flex-1 bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 overflow-y-auto border border-slate-100 dark:border-slate-800">
                                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-a:text-blue-600 dark:prose-a:text-blue-400">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {editContent || 'אין תוכן...'}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ) : (
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    placeholder="התחל לכתוב... (תומך ב-Markdown)"
                                    className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 dark:text-slate-300 font-mono text-sm leading-relaxed"
                                />
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col animate-in fade-in duration-300">
                            <div className="flex items-start justify-between mb-8 group">
                                <div>
                                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">{selectedNote.title}</h1>
                                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            עודכן: {format(new Date(selectedNote.updatedAt), 'd MMMM yyyy, HH:mm', { locale: he })}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={startEditing}
                                    className="px-4 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl flex items-center gap-2 font-medium transition-colors"
                                >
                                    <Edit2 size={16} />
                                    ערוך פתק
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                                {selectedNote.content ? (
                                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-bold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-img:rounded-xl">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {selectedNote.content}
                                        </ReactMarkdown>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                        <AlignLeft size={48} className="opacity-20" />
                                        <p>הפתק ריק.</p>
                                        <button onClick={startEditing} className="text-blue-500 font-medium hover:underline">לחץ כאן כדי להתחיל לכתוב</button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
                        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-2">
                            <FileText size={48} className="text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-xl font-medium text-slate-600 dark:text-slate-300">בחר פתק כדי לצפות או לערוך</h3>
                        <p className="text-sm">או צור פתק חדש בעזרת כפתור ה-<Plus size={14} className="inline" /> ברשימה.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
