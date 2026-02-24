import { LogOut, Mail, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import Dialog from '../../components/ui/dialog';

const Sidebar = ({ sidebarCollapsed, navItems }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const logout = useLogout();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      setShowLogoutDialog(false);
      navigate('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-screen bg-white border-r border-slate-200/60 transition-all duration-500 z-30 flex flex-col no-scrollbar ${
          sidebarCollapsed ? 'w-20' : 'w-70'
        }`}
      >
        {/* Superior Logo Section - Removed toggle button */}
        <div className="flex items-center h-20 px-6 border-b border-slate-100 bg-white/50 backdrop-blur-xl sticky top-0 z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="flex items-center gap-3 group cursor-pointer"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-105 transition-transform duration-500">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-extrabold text-slate-800 tracking-tighter leading-none">
                  Unibox<span className="text-blue-600">.</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Growth Platform
                </span>
              </div>
            )}
          </motion.div>
        </div>

        {/* Premium Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-4 space-y-8 no-scrollbar">
          {!sidebarCollapsed && (
            <div className="px-2">
              <div className="bg-linear-to-br from-blue-500 to-indigo-600 rounded-3xl p-5 shadow-2xl shadow-blue-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-100" />
                    <span className="text-[10px] font-extrabold text-blue-50 uppercase tracking-widest">
                      Growth Plan
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white leading-relaxed opacity-90">
                    Reach 5k more leads today with AI automation.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/subscription')}
                    className="mt-4 w-full py-2 bg-white text-blue-600 rounded-xl text-[10px] font-extrabold uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg shadow-black/5"
                  >
                    Upgrade Now
                  </button>
                </div>
              </div>
            </div>
          )}

          <nav className="space-y-1.5">
            {!sidebarCollapsed && (
              <div className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-2">
                Main Dashboard
              </div>
            )}
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.1 + index * 0.05,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                >
                  <Link
                    to={item.path}
                    onMouseEnter={() => setActiveHover(item.path)}
                    onMouseLeave={() => setActiveHover(null)}
                    className={`group relative flex items-center rounded-2xl px-4 py-3.5 transition-all duration-300 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-xl shadow-slate-900/10'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <Icon
                        className={`w-5 h-5 transition-all duration-300 ${
                          isActive ? 'scale-110' : 'group-hover:text-blue-500 group-hover:scale-110'
                        }`}
                      />
                      {isActive && (
                        <motion.div
                          layoutId="activeNavIndicator"
                          className="absolute -left-5 w-1 h-6 bg-blue-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                        />
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <div className="ml-4 flex-1 flex items-center justify-between overflow-hidden">
                        <span
                          className={`text-sm tracking-tight transition-all duration-300 ${isActive ? 'font-extrabold opacity-100' : 'font-bold opacity-80 group-hover:opacity-100'}`}
                        >
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded-lg uppercase tracking-widest ${
                              isActive ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    {sidebarCollapsed && activeHover === item.path && (
                      <div className="absolute left-full ml-4 px-3 py-2 bg-blue-600 text-white text-[10px] font-extrabold uppercase tracking-widest rounded-xl shadow-2xl z-50 animate-in fade-in slide-in-from-left-2 duration-200 pointer-events-none whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>
        </div>

        {/* Ultra Premium User Profile */}
        <div className="p-4 border-t border-slate-100 bg-white/80 backdrop-blur-xl">
          <div
            className={`p-3 rounded-3xl transition-all duration-300 border border-transparent flex items-center gap-3 ${
              sidebarCollapsed
                ? 'justify-center'
                : 'hover:bg-slate-50 hover:border-slate-100 group cursor-pointer shadow-xs active:scale-[0.98]'
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 p-0.5 border border-slate-200 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-800 font-extrabold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
              </div>
            </div>

            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-500">
                <p className="text-xs font-extrabold text-slate-800 truncate tracking-tight">
                  {user?.name || 'Premium User'}
                </p>
                <p className="text-[10px] font-bold text-slate-400 truncate uppercase mt-0.5 tracking-widest">
                  {user?.role || 'Administrator'}
                </p>
              </div>
            )}

            {!sidebarCollapsed && (
              <button
                onClick={() => setShowLogoutDialog(true)}
                disabled={logout.isPending}
                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-300 hover:scale-110 active:scale-90"
              >
                {logout.isPending ? (
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Modern Logout Dialog */}
      <Dialog
        open={showLogoutDialog}
        title="Terminate Session"
        description="Are you sure you want to end your current dashboard session? You will need to re-authenticate."
        confirmText="Confirm Logout"
        cancelText="Stay Logged In"
        confirmVariant="danger"
        isLoading={logout.isPending}
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
        setOpen={setShowLogoutDialog}
      />
    </>
  );
};

export default Sidebar;
