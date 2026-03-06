import { useTaskStore } from '../store/useTaskStore';

export function SettingsView() {
    const { settings, setSettings } = useTaskStore();

    return (
        <div className="max-w-3xl mx-auto space-y-8" dir="rtl">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">הגדרות מערכת</h2>
                <p className="text-slate-500 dark:text-slate-400">נהל את העדפות המראה וההתנהגות של מרכז הבקרה שלך.</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">תצוגה ועיצוב</h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                ערכת נושא
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['light', 'dark', 'system'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setSettings({ theme: t })}
                                        className={`flex items-center justify-center py-2.5 rounded-xl border text-sm font-medium transition-all ${settings.theme === t
                                                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                                                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {t === 'light' ? 'בהיר' : t === 'dark' ? 'כהה' : 'מערכת'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                גופן עברית ראשי
                            </label>
                            <select
                                value={settings.fontFamily}
                                onChange={(e) => setSettings({ fontFamily: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="Heebo, sans-serif">Heebo (קלסי ומודרני)</option>
                                <option value="Assistant, sans-serif">Assistant (נקי וברור)</option>
                                <option value="Rubik, sans-serif">Rubik (רך ומעוגל)</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-800/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-slate-900 dark:text-white">ניגודיות גבוהה & נגישות</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">שיפור הקריאות עבור לקויי ראייה.</p>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 dark:bg-slate-700 transition-colors">
                            <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
