import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2, ExternalLink, Link as LinkIcon, GripVertical, Settings2 } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import type { Id, LinkItem } from '../types';
import { cn } from '../utils';
import { LinkModal } from './LinkModal';

export function LinksHubView() {
    const { linkGroups, links, activeWorkspaceId, addLinkGroup, deleteLinkGroup, addLink, deleteLink, setLinks } = useTaskStore();
    const workspaceGroups = linkGroups.filter(g => g.workspaceId === activeWorkspaceId);
    const workspaceLinks = links.filter(l => l.workspaceId === activeWorkspaceId);

    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [newGroupTitle, setNewGroupTitle] = useState('');
    const [selectedLink, setSelectedLink] = useState<LinkItem | null>(null);

    // Quick Add Link Modal State
    const [addingLinkToGroup, setAddingLinkToGroup] = useState<Id | null>(null);
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

    const handleDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceGroupId = source.droppableId;
        const destGroupId = destination.droppableId;

        if (sourceGroupId === destGroupId) {
            const groupLinks = workspaceLinks.filter(l => l.groupId === sourceGroupId);
            const [reorderedItem] = groupLinks.splice(source.index, 1);
            groupLinks.splice(destination.index, 0, reorderedItem);

            const otherLinks = workspaceLinks.filter(l => l.groupId !== sourceGroupId);
            const otherWorkspacesLinks = links.filter(l => l.workspaceId !== activeWorkspaceId);
            setLinks([...otherWorkspacesLinks, ...otherLinks, ...groupLinks]);
        } else {
            const sourceGroupLinks = workspaceLinks.filter(l => l.groupId === sourceGroupId);
            const destGroupLinks = workspaceLinks.filter(l => l.groupId === destGroupId);

            const [draggedLink] = sourceGroupLinks.splice(source.index, 1);
            if (!draggedLink) return;

            const updatedLink = { ...draggedLink, groupId: destGroupId };
            destGroupLinks.splice(destination.index, 0, updatedLink);

            const otherLinks = workspaceLinks.filter(l => l.groupId !== sourceGroupId && l.groupId !== destGroupId);
            const otherWorkspacesLinks = links.filter(l => l.workspaceId !== activeWorkspaceId);

            setLinks([...otherWorkspacesLinks, ...otherLinks, ...sourceGroupLinks, ...destGroupLinks]);
        }
    };

    const handleAddGroup = () => {
        if (!newGroupTitle.trim()) return;
        addLinkGroup(newGroupTitle);
        setNewGroupTitle('');
        setIsAddingGroup(false);
    };

    const handleAddLink = (groupId: Id) => {
        if (!newLinkTitle.trim() || !newLinkUrl.trim()) return;

        let url = newLinkUrl.trim();
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }

        const newLink: Omit<LinkItem, 'workspaceId'> = {
            id: `l-${Date.now()}`,
            groupId,
            title: newLinkTitle,
            url,
        };
        addLink(newLink);
        setAddingLinkToGroup(null);
        setNewLinkTitle('');
        setNewLinkUrl('');
    };

    return (
        <div className="h-full flex flex-col" dir="rtl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-3">
                        <LinkIcon className="text-blue-500" size={32} /> מרכז לינקים חשובים
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">ארגן ונהל את הגישה לכלים היומיומיים שלך בלוח קטגוריות נוח.</p>
                </div>
                <button
                    onClick={() => setIsAddingGroup(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-sm text-sm font-semibold transition-colors flex items-center gap-2"
                >
                    <Plus size={18} /> קטגוריה חדשה
                </button>
            </div>

            {isAddingGroup && (
                <div className="mb-8 p-6 bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-end gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">שם הקטגוריה</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="למשל: כלי פיתוח, עיצוב..."
                            value={newGroupTitle}
                            onChange={(e) => setNewGroupTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:text-white"
                        />
                    </div>
                    <button onClick={() => setIsAddingGroup(false)} className="px-5 py-2.5 text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 rounded-xl transition text-sm font-medium">ביטול</button>
                    <button onClick={handleAddGroup} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl transition text-sm font-semibold">הוסף הקטגוריה</button>
                </div>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
                    <div className="flex gap-6 items-start">
                        {workspaceGroups.map((group) => (
                            <div key={group.id} className="min-w-[320px] max-w-[320px] bg-slate-100 dark:bg-slate-800/60 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-slate-800 backdrop-blur-md">
                                <div className="flex justify-between items-center mb-4 group/header">
                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{group.title}</h3>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { if (confirm('האם למחוק קטגוריה זו ואת כל הלינקים שבה?')) deleteLinkGroup(group.id); }}
                                            className="opacity-0 group-hover/header:opacity-100 p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <Droppable droppableId={String(group.id)}>
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={cn(
                                                "min-h-[100px] flex flex-col gap-3 rounded-2xl transition-colors duration-200 mb-4",
                                                snapshot.isDraggingOver ? "bg-slate-200/50 dark:bg-slate-700/40" : ""
                                            )}
                                        >
                                            {workspaceLinks.filter(l => l.groupId === group.id).map((link, index) => (
                                                <Draggable key={link.id} draggableId={String(link.id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={cn(
                                                                "group relative flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md",
                                                                snapshot.isDragging ? "shadow-xl scale-[1.03] rotate-2 ring-2 ring-blue-500/30 z-50 cursor-grabbing" : ""
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3 overflow-hidden">
                                                                <div {...provided.dragHandleProps} className="text-slate-300 hover:text-slate-500 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <GripVertical size={18} />
                                                                </div>

                                                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                    <img src={`https://www.google.com/s2/favicons?domain=${link.url}&sz=64`} alt="" className="w-6 h-6 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                                                </div>

                                                                <div className="flex flex-col overflow-hidden">
                                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate">{link.title}</span>
                                                                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-500 hover:underline truncate" title={link.url}>
                                                                        {link.url.replace(/^https?:\/\/(www\.)?/, '')}
                                                                    </a>
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onClick={() => setSelectedLink(link)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/40 rounded-lg" title="הגדרות וסיסמאות">
                                                                    <Settings2 size={16} />
                                                                </button>
                                                                <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg" title="פתח קישור">
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                                <button onClick={() => deleteLink(link.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg">
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>

                                {/* Quick Add Link within Group */}
                                {addingLinkToGroup === group.id ? (
                                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="כותרת הלינק..."
                                            value={newLinkTitle}
                                            onChange={(e) => setNewLinkTitle(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 dark:text-white mb-2"
                                        />
                                        <input
                                            type="url"
                                            placeholder="https://..."
                                            value={newLinkUrl}
                                            onChange={(e) => setNewLinkUrl(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddLink(group.id)}
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-500 dark:text-white mb-3 text-left"
                                            dir="ltr"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={() => { setAddingLinkToGroup(null); setNewLinkTitle(''); setNewLinkUrl(''); }}>ביטול</button>
                                            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition" onClick={() => handleAddLink(group.id)}>שמור</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setAddingLinkToGroup(group.id)}
                                        className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-medium hover:border-slate-400 hover:text-slate-600 dark:hover:border-slate-500 transition-all flex items-center justify-center gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50"
                                    >
                                        <Plus size={18} /> הוסף לינק
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </DragDropContext>

            {selectedLink && (
                <LinkModal
                    link={selectedLink}
                    isOpen={!!selectedLink}
                    onClose={() => setSelectedLink(null)}
                />
            )}
        </div>
    );
}
