import { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays
} from 'date-fns';
import { he } from 'date-fns/locale';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { useTaskStore } from '../store/useTaskStore';
import { cn } from '../utils';
import type { Task } from '../types';

interface CalendarViewProps {
    onTaskClick: (task: Task) => void;
}

export function CalendarView({ onTaskClick }: CalendarViewProps) {
    const { tasks, activeWorkspaceId } = useTaskStore();
    const workspaceTasks = tasks.filter(t => t.workspaceId === activeWorkspaceId);
    const [currentDate, setCurrentDate] = useState(new Date());

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    // Determine the days to display in the grid (weeks)
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // 0 = Sunday
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const dateFormat = "d";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, dateFormat);
            const cloneDay = day;

            // Get tasks falling on this exact day
            const dayTasks = workspaceTasks.filter(task => {
                if (!task.dueDate) return false;
                return isSameDay(new Date(task.dueDate), cloneDay);
            });

            days.push(
                <div
                    key={day.toString()}
                    className={cn(
                        "min-h-[120px] p-2 border-r border-b border-slate-200 dark:border-slate-800 transition-colors flex flex-col gap-1 overflow-hidden",
                        !isSameMonth(day, monthStart)
                            ? "bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600"
                            : isSameDay(day, new Date())
                                ? "bg-blue-50/30 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-semibold"
                                : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200",
                        i === 0 && "border-r-0" // Remove right border for Sunday in RTL
                    )}
                >
                    <div className="flex justify-between items-center mb-1 px-1">
                        <span className={cn(
                            "text-sm",
                            isSameDay(day, new Date()) && "bg-blue-600 text-white w-6 h-6 flex items-center justify-center rounded-full"
                        )}>
                            {formattedDate}
                        </span>
                        {dayTasks.length > 0 && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
                                {dayTasks.length}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 pr-1">
                        {dayTasks.map((task) => (
                            <div
                                key={task.id}
                                onClick={() => onTaskClick(task)}
                                className={cn(
                                    "text-[11px] leading-tight px-2 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-all hover:-translate-y-0.5 shadow-sm border border-transparent",
                                    task.columnId === 'done'
                                        ? "bg-slate-100 text-slate-500 line-through dark:bg-slate-800/80 dark:text-slate-500"
                                        : task.priority === 'high'
                                            ? "bg-rose-50 text-rose-700 border-rose-100 hover:border-rose-300 hover:shadow-md dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-300"
                                            : task.priority === 'medium'
                                                ? "bg-amber-50 text-amber-700 border-amber-100 hover:border-amber-300 hover:shadow-md dark:bg-amber-900/20 dark:border-amber-900/50 dark:text-amber-300"
                                                : "bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300 hover:shadow-md dark:bg-blue-900/30 dark:border-blue-800/50 dark:text-blue-300"
                                )}
                            >
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full shrink-0",
                                    task.columnId === 'done' ? "bg-slate-300 dark:bg-slate-600" :
                                        task.columnId === 'in_progress' ? "bg-amber-400" : "bg-blue-400"
                                )} />
                                <span className="truncate">{task.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="grid grid-cols-7" key={day.toString()}>
                {days}
            </div>
        );
        days = [];
    }

    const weekDays = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-500">

            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: he })}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>{workspaceTasks.filter(t => t.dueDate).length} משימות עם תאריך יעד</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                                היום
                            </button>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={nextMonth} // In RTL, next should visually be Right chevron to go forward in time usually, but in Hebrew "Next month" is logically forward, visually left in RTL calendar flows. Wait, in Hebrew RTL: right arrow is next month (moving right on a timeline)? Actually, left is usually future in RTL timelines. Let's use Right arrow for Prev, Left for Next to map visually to reading direction.
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ChevronRight size={20} />
                    </button>
                    <button
                        onClick={prevMonth}
                        className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 dark:hover:text-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ChevronLeft size={20} />
                    </button>
                </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50">
                {weekDays.map((day, i) => (
                    <div
                        key={day}
                        className={cn(
                            "py-3 text-center text-xs font-bold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800",
                            i === 0 && "border-r-0"
                        )}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 overflow-y-auto bg-slate-100/30 dark:bg-slate-900">
                {rows}
            </div>

        </div>
    );
}
