import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, RefreshCw, LogOut, ShieldAlert } from 'lucide-react';
import { SESSION_EXPIRED_EVENT } from '../../lib/session-events';

/**
 * SessionExpiredModal
 *
 * Listens for SESSION_EXPIRED_EVENT dispatched by api.js when the
 * refresh-token call also returns 401. Shows a blocking modal with two CTAs:
 *   • Refresh Session  – calls /auth/refresh-token and reloads the page
 *   • Log Out          – redirects to /auth/login
 *
 * The modal is intentionally non-dismissable (no backdrop click / no ESC)
 * so the user is forced to take action.
 */
const SessionExpiredModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const handleExpired = () => {
      // Don't show the modal if the user is already on an auth page
      if (window.location.pathname.startsWith('/auth/')) {
        return;
      }
      setIsOpen(true);
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleExpired);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        // Token refreshed — reload to restore app state cleanly
        window.location.reload();
      } else {
        // Refresh failed (e.g. 401 No refresh token) — force logout
        handleLogout();
      }
    } catch (err) {
      console.error('[SessionExpiredModal] Refresh failed:', err);
      handleLogout();
    }
  };

  const handleLogout = () => {
    setIsOpen(false);
    // Force a full clean redirect to the login page
    window.location.replace('/auth/login');
  };

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-99999 flex items-center justify-center p-4">
          {/* Frosted backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="relative w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)]"
          >
            {/* Header gradient strip */}
            <div className="relative overflow-hidden bg-linear-to-br from-orange-500 via-orange-600 to-red-600 px-6 py-5">
              {/* Decorative blobs */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/10 blur-xl" />

              <div className="relative flex items-center gap-4">
                <motion.div
                  initial={{ rotate: -15, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                  className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-white/15 backdrop-blur-sm"
                >
                  <Clock className="h-6 w-6 text-white" />
                </motion.div>

                <div>
                  <h2 className="font-outfit text-xl font-extrabold uppercase tracking-tight text-white">
                    Session Expired
                  </h2>
                  <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-orange-100/70">
                    Authentication required
                  </p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="px-7 py-6">
              {/* Icon + message */}
              <div className="mb-5 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-orange-100 bg-orange-50">
                  <ShieldAlert className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Your session has expired</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    You&apos;ve been inactive for a while. Refresh your session to continue working, or log out
                    to return to the login page.
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="mb-5 h-px bg-slate-100" />

              {/* CTA Buttons */}
              <div className="flex flex-col gap-3">
                {/* Primary – Refresh */}
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-md bg-linear-to-r from-orange-500 to-orange-600 px-6 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-white shadow-sm shadow-orange-500/20 transition-all hover:shadow-md hover:shadow-orange-500/30 active:scale-[0.98] disabled:opacity-60"
                >
                  {/* shimmer on hover */}
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {isRefreshing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Refreshing…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 transition-transform group-hover:rotate-180 duration-500" />
                      Refresh Session
                    </>
                  )}
                </button>

                {/* Secondary – Logout */}
                <button
                  onClick={handleLogout}
                  disabled={isRefreshing}
                  className="flex w-full items-center justify-center gap-2.5 rounded-md border border-slate-200 bg-white px-6 py-2.5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 transition-all hover:border-slate-300 hover:text-slate-700 active:scale-[0.98] disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </button>
              </div>

              {/* Footer note */}
              <p className="mt-5 text-center text-[9px] font-bold uppercase tracking-widest text-slate-300">
                Your unsaved work may be lost
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default SessionExpiredModal;
