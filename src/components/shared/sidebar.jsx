import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useCurrentUser, useLogout } from '../../hooks/useAuth';
import Dialog from '../../components/ui/dialog';
import Logo from './logo';
import { LogOut, X } from 'lucide-react';

const Sidebar = ({ sidebarCollapsed, setSidebarCollapsed, navItems }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: user } = useCurrentUser();
  const logout = useLogout();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.dir() === 'rtl';

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [activeHover, setActiveHover] = useState(null);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      setShowLogoutDialog(false);
      navigate('/auth/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if API fails (e.g. 401 already expired), force the user out
      setShowLogoutDialog(false);
      navigate('/auth/login', { replace: true });
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!sidebarCollapsed && (
        <div
          className="fixed inset-0 bg-zinc-900/40  z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <aside
        className={`fixed ltr:left-0 rtl:right-0 top-0 h-screen bg-white ltr:border-r rtl:border-l border-zinc-200 transition-all duration-300 z-50 flex flex-col no-scrollbar ${
          sidebarCollapsed
            ? '-translate-x-full lg:translate-x-0 lg:w-[64px]'
            : 'translate-x-0 w-[240px]'
        }`}
      >
        {/* Strict Logo Section */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-zinc-200 bg-white sticky top-0 z-10 shrink-0">
          <motion.div
            initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 cursor-pointer w-full group"
            onClick={() => navigate('/dashboard')}
          >
            <Logo isCollapsed={sidebarCollapsed} showTagline={true} />
          </motion.div>

          {/* Mobile Close Button */}
          {!sidebarCollapsed && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSidebarCollapsed(true);
              }}
              className="lg:hidden absolute ltr:right-2 rtl:left-2 z-50 p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Minimalist Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-6 no-scrollbar bg-white">
          <nav className="space-y-0.5">
            {!sidebarCollapsed && (
              <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                {t('common.main_dashboard')}
              </div>
            )}
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

              return (
                <div key={item.path} className="relative">
                  <Link
                    to={item.path}
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        setSidebarCollapsed(true);
                      }
                    }}
                    onMouseEnter={() => setActiveHover(item.path)}
                    onMouseLeave={() => setActiveHover(null)}
                    className={`group flex items-center rounded-md px-3 py-2 transition-colors duration-150 ${
                      isActive
                        ? 'bg-orange-50 text-orange-700 font-semibold'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 font-medium'
                    }`}
                  >
                    <div className="flex items-center justify-center shrink-0">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive ? 'text-orange-600' : 'text-zinc-500 group-hover:text-zinc-900'
                        }`}
                      />
                    </div>
                    
                    {!sidebarCollapsed && (
                      <div className="ltr:ml-3 rtl:mr-3 flex-1 flex items-center justify-between overflow-hidden">
                        <span className="text-[13px] truncate">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] rounded font-semibold ${
                              isActive ? 'bg-orange-100 text-orange-700' : 'bg-zinc-100 text-zinc-500'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {sidebarCollapsed && activeHover === item.path && (
                      <div className="absolute left-full ltr:ml-2 rtl:mr-2 px-2.5 py-1.5 bg-zinc-900 text-white text-[11px] font-semibold rounded shadow-sm z-100 whitespace-nowrap animate-in fade-in slide-in-from-left-1 duration-200 pointer-events-none">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Minimalist User Profile */}
        <div className="p-3 border-t border-zinc-200 bg-white sticky bottom-0 shrink-0">
          <div
            className={`p-2 rounded-md transition-colors flex items-center gap-3 ${
              sidebarCollapsed
                ? 'justify-center'
                : 'hover:bg-zinc-50 cursor-pointer'
            }`}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-900 font-semibold text-[13px]">
                {user?.name?.charAt(0) || t('common.u', 'U')}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-zinc-900 truncate">
                  {user?.name || t('common.user', 'User')}
                </p>
                <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-medium">
                  {user?.role || t('common.administrator', 'Administrator')}
                </p>
              </div>
            )}

            <div className={`${sidebarCollapsed ? 'hidden lg:hidden' : ''}`}>
              <button
                onClick={() => setShowLogoutDialog(true)}
                disabled={logout.isPending}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-200 rounded transition-colors"
                title={t('common.logout.title')}
              >
                {logout.isPending ? (
               <div className="w-4 h-4 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Modern Logout Dialog */}
      <Dialog
        open={showLogoutDialog}
        title={t('common.logout.title')}
        description={t('common.logout.desc')}
        confirmText={t('common.logout.confirm')}
        cancelText={t('common.logout.cancel')}
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
