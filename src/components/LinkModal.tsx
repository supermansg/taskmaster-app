import { useState, useEffect } from 'react';
import { X, Lock, Eye, EyeOff, Save, Key } from 'lucide-react';
import CryptoJS from 'crypto-js';
import type { LinkItem } from '../types';
import { useTaskStore } from '../store/useTaskStore';

interface LinkModalProps {
    link: LinkItem;
    isOpen: boolean;
    onClose: () => void;
}

export function LinkModal({ link, isOpen, onClose }: LinkModalProps) {
    const { updateLink, masterPassword, setMasterPassword } = useTaskStore();

    const [title, setTitle] = useState(link.title);
    const [url, setUrl] = useState(link.url);
    const [username, setUsername] = useState(link.username || '');
    const [rawPassword, setRawPassword] = useState('');

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showMasterPrompt, setShowMasterPrompt] = useState(false);
    const [tempMasterInput, setTempMasterInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    // Attempt to decrypt if masterPassword is set
    useEffect(() => {
        if (isOpen) {
            setTitle(link.title);
            setUrl(link.url);
            setUsername(link.username || '');
            setRawPassword('');
            setIsEditingPassword(false);
            setShowMasterPrompt(false);
            setErrorMessage('');

            if (link.encryptedPassword && masterPassword) {
                try {
                    const bytes = CryptoJS.AES.decrypt(link.encryptedPassword, masterPassword);
                    const dec = bytes.toString(CryptoJS.enc.Utf8);
                    if (dec) {
                        setRawPassword(dec);
                    }
                } catch (e) { /* silent fail on mount */ }
            }
        }
    }, [isOpen, link, masterPassword]);

    if (!isOpen) return null;

    const handleAuthenticate = () => {
        if (!tempMasterInput.trim()) {
            setErrorMessage('חובה להזין סיסמת מאסטר');
            return;
        }

        if (link.encryptedPassword) {
            try {
                const bytes = CryptoJS.AES.decrypt(link.encryptedPassword, tempMasterInput);
                const dec = bytes.toString(CryptoJS.enc.Utf8);
                if (!dec) throw new Error();
                setRawPassword(dec);
                setMasterPassword(tempMasterInput); // save session
                setShowMasterPrompt(false);
                setErrorMessage('');
                setIsPasswordVisible(true);
            } catch (e) {
                setErrorMessage('סיסמת מאסטר שגויה');
            }
        } else {
            // First time defining a password for this link, or globally.
            setMasterPassword(tempMasterInput);
            setShowMasterPrompt(false);
            setErrorMessage('');
            setIsEditingPassword(true);
        }
    };

    const handleSave = () => {
        let encryptedPassword = link.encryptedPassword;

        if (isEditingPassword) {
            if (rawPassword) {
                if (!masterPassword) {
                    setShowMasterPrompt(true);
                    return;
                }
                encryptedPassword = CryptoJS.AES.encrypt(rawPassword, masterPassword).toString();
            } else {
                encryptedPassword = undefined;
            }
        }

        updateLink(link.id, {
            title,
            url,
            username: username || undefined,
            encryptedPassword
        });

        onClose();
    };

    const handleViewPassword = () => {
        if (!masterPassword) {
            setShowMasterPrompt(true);
        } else {
            setIsPasswordVisible(!isPasswordVisible);
        }
    };

    const handleClearMaster = () => {
        if (confirm('האם לנעול את הכספת ולמחוק את הסיסמה מזכרון הדפדפן (Session)?')) {
            setMasterPassword(null);
            setRawPassword('');
            setIsPasswordVisible(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden" dir="rtl">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Key className="text-emerald-500" size={20} /> אבטחה ופרטי הלינק
                    </h2>
                    <div className="flex items-center gap-2">
                        {masterPassword && (
                            <button onClick={handleClearMaster} className="text-xs flex items-center gap-1 text-slate-500 hover:text-emerald-600 bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm border border-slate-200 dark:border-slate-700">
                                <Lock size={12} /> נעל כספת
                            </button>
                        )}
                        <button onClick={onClose} className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 dark:hover:text-slate-200 p-1.5 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {showMasterPrompt ? (
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-5 animate-in slide-in-from-bottom-4">
                            <div className="flex items-center gap-2 mb-3 text-emerald-800 dark:text-emerald-400 font-bold">
                                <Lock size={18} /> הזן סיסמת מאסטר
                            </div>
                            <p className="text-xs text-emerald-700/80 dark:text-emerald-500/80 mb-4">
                                {link.encryptedPassword
                                    ? "הסיסמה של אתר זה מוצפנת. הזן את סיסמת המאסטר הכללית שלך כדי לפענח אותה."
                                    : "עדיין לא הגדרת סיסמת מאסטר לסשן זה. הגדר אחת עכשיו כדי להצפין את כל סיסמאות הכספת."}
                            </p>

                            <input
                                autoFocus
                                type="password"
                                placeholder="..."
                                value={tempMasterInput}
                                onChange={(e) => setTempMasterInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAuthenticate()}
                                className="w-full bg-white dark:bg-slate-950 border border-emerald-200 dark:border-emerald-900 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white mb-2"
                            />
                            {errorMessage && <p className="text-xs text-red-500 mb-3">{errorMessage}</p>}

                            <div className="flex justify-end gap-2 mt-4">
                                <button onClick={() => setShowMasterPrompt(false)} className="text-sm px-4 py-2 text-emerald-700 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-xl transition">ביטול</button>
                                <button onClick={handleAuthenticate} className="text-sm px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition">
                                    {link.encryptedPassword ? 'פענח והצג' : 'קבע סיסמת מאסטר להצפנה'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">כותרת הלינק</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-none focus:border-blue-500 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">כתובת (URL)</label>
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-none focus:border-blue-500 dark:text-white text-left"
                                        dir="ltr"
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100 dark:border-slate-800 my-4" />

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">שם משתמש / אימייל</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-none focus:border-blue-500 dark:text-white text-left"
                                        dir="ltr"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">סיסמה מוצפנת מקומית</label>
                                    {isEditingPassword || !link.encryptedPassword ? (
                                        <div className="relative">
                                            <input
                                                type={isPasswordVisible ? 'text' : 'password'}
                                                value={rawPassword}
                                                onChange={(e) => { setRawPassword(e.target.value); setIsEditingPassword(true); }}
                                                placeholder="הזן את סיסמת האתר..."
                                                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-emerald-700 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:focus:ring-emerald-500/50 dark:text-white text-left text-sm mt-1 focus:border-emerald-500"
                                                dir="ltr"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                            >
                                                {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2 items-center">
                                            <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 flex items-center justify-between mt-1">
                                                <span className="text-xl tracking-widest text-slate-400 select-none translate-y-1">••••••••</span>
                                                {masterPassword && rawPassword && isPasswordVisible && (
                                                    <span className="text-sm font-mono text-slate-800 dark:text-slate-200 ml-2" dir="ltr">{rawPassword}</span>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleViewPassword}
                                                className="h-[42px] px-4 mt-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition flex items-center gap-2 text-sm font-medium"
                                            >
                                                {masterPassword && isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                                {masterPassword && isPasswordVisible ? 'הסתר' : 'הצג'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (!masterPassword) { setShowMasterPrompt(true); return; }
                                                    setIsEditingPassword(true);
                                                }}
                                                className="h-[42px] px-4 mt-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition flex items-center text-sm font-medium"
                                            >
                                                ערוך
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-8">
                                <button onClick={onClose} className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">ביטול</button>
                                <button onClick={handleSave} className="px-6 py-2.5 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm text-sm font-semibold transition">
                                    <Save size={18} /> שמור שינויים
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
