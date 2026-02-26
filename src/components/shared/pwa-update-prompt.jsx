import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const PWAUpdatePrompt = () => {
    const sw = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    // Use defensive destructuring to avoid "Cannot destructure ... as it is undefined"
    const [offlineReady, setOfflineReady] = sw?.offlineReady || [false, () => { }];
    const [needUpdate, setNeedUpdate] = sw?.needUpdate || [false, () => { }];
    const updateServiceWorker = sw?.updateServiceWorker;

    const close = () => {
        setOfflineReady(false);
        setNeedUpdate(false);
    };

    return (
        <AnimatePresence>
            {(offlineReady || needUpdate) && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    className="fixed bottom-6 right-6 z-[99999] max-w-sm w-full"
                >
                    <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-6 shadow-2xl shadow-indigo-500/10 overflow-hidden relative group">
                        {/* Background Glow */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-colors duration-700"></div>

                        <div className="relative flex items-start gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                                <Zap className="w-6 h-6 text-white" />
                            </div>

                            <div className="flex-1 pt-1">
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">
                                    {offlineReady ? 'App Ready' : 'Update Available'}
                                </h4>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                                    {offlineReady
                                        ? 'App is now ready to work offline'
                                        : 'A new version of Unibox is ready for you.'}
                                </p>

                                <div className="flex items-center gap-3 mt-4">
                                    {needUpdate && (
                                        <button
                                            onClick={() => updateServiceWorker(true)}
                                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-3 h-3" />
                                            Reload Now
                                        </button>
                                    )}
                                    <button
                                        onClick={close}
                                        className={`flex items-center justify-center rounded-xl transition-all active:scale-95 ${needUpdate
                                            ? 'w-10 h-10 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'
                                            : 'w-full bg-slate-800 text-white py-2.5 text-[10px] font-black uppercase tracking-[0.15em]'
                                            }`}
                                    >
                                        {needUpdate ? <X className="w-4 h-4" /> : 'Dismiss'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default PWAUpdatePrompt;
