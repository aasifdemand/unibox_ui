import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ur', name: 'اردو', flag: '🇵🇰' },
];

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const changeLanguage = (code) => {
        i18n.changeLanguage(code);
        localStorage.setItem('i18nextLng', code);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100/50 border border-slate-200/60 hover:bg-white hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 active:scale-95 group"
            >
                <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:rotate-12 transition-transform duration-500">
                    <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest">
                    {currentLanguage.code}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute top-full ltr:right-0 rtl:left-0 mt-3 w-48 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/60 p-2 z-[60] overflow-hidden"
                    >
                        <div className="px-3 py-2 mb-1">
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">Select Language</span>
                        </div>
                        {languages.map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 group ${i18n.language === lang.code
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm grayscale-0 group-hover:scale-110 transition-transform">{lang.flag}</span>
                                    <span className={`text-sm tracking-tight ${i18n.language === lang.code ? 'font-bold' : 'font-semibold'}`}>
                                        {lang.name}
                                    </span>
                                </div>
                                {i18n.language === lang.code && (
                                    <Check className="w-3.5 h-3.5 text-white" />
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher;
