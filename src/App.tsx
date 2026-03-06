import { useState, useEffect } from 'react';
import { Board } from './components/Board';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SettingsView } from './components/SettingsView';
import { CalendarView } from './components/CalendarView';
import { TaskModal } from './components/TaskModal';
import { CommandPalette } from './components/CommandPalette';
import { NotesView } from './components/NotesView';
import { LinksHubView } from './components/LinksHubView';
import { useTaskStore } from './store/useTaskStore';
import type { Task } from './types';

export default function App() {
  const settings = useTaskStore((state) => state.settings);
  const [currentView, setCurrentView] = useState<'board' | 'calendar' | 'settings' | 'notes' | 'links'>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // CMD/CTRL + K to open Command Palette
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Apply Theme & Font from Settings
  useEffect(() => {
    const root = document.documentElement;
    let isDark = false;

    if (settings.theme === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      isDark = settings.theme === 'dark';
    }

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply custom font
    root.style.fontFamily = settings.fontFamily;
  }, [settings.theme, settings.fontFamily]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 transition-colors duration-200" dir="rtl">
      <Header />

      <div className="flex flex-1 overflow-hidden antialiased">
        <Sidebar currentView={currentView} onChangeView={setCurrentView} />

        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-slate-50/50 dark:bg-slate-900/50 p-6 md:p-8">
          {currentView === 'board' && (
            <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Board onTaskClick={setSelectedTask} />
            </div>
          )}

          {currentView === 'calendar' && (
            <div className="h-full">
              <CalendarView onTaskClick={setSelectedTask} />
            </div>
          )}

          {currentView === 'notes' && (
            <div className="h-full animate-in fade-in zoom-in-95 duration-500">
              <NotesView />
            </div>
          )}

          {currentView === 'links' && (
            <div className="h-full animate-in fade-in zoom-in-95 duration-500">
              <LinksHubView />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="h-full animate-in fade-in slide-in-from-right-8 duration-500">
              <SettingsView />
            </div>
          )}
        </main>
      </div>

      {/* Global Modals */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={setCurrentView}
        onTaskSelect={setSelectedTask}
      />
    </div>
  );
}
