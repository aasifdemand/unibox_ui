import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
  Zap,
  Mailbox,
  PanelLeftClose,
  PanelLeftOpen,
  Link2,
  Send,
  ChevronRight,
  Home,
  ShieldCheck,
} from 'lucide-react';
import Sidebar from '../components/shared/sidebar';
import LanguageSwitcher from '../components/shared/language-switcher';
import GlobalSearch from '../components/shared/global-search';
import NotificationDropdown from '../components/shared/notification-dropdown';

import { useCurrentUser } from '../hooks/useAuth';
import { useCampaigns } from '../hooks/useCampaign';
import { useMailboxes } from '../hooks/useMailboxes';
import { useAllContacts } from '../routes/dashboard/audience/hooks/use-all-contacts';
import { useSocketEvents } from '../hooks/useSocketEvents';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const { t, i18n } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Global Real-Time Event Listener
  useSocketEvents('notification', (payload) => {
    const { type = 'info', message, title } = payload;
    const displayText = title ? `${title}: ${message}` : message;
    if (type === 'success') toast.success(displayText);
    else if (type === 'error') toast.error(displayText);
    else toast(displayText, { icon: '🔔' });
  });


  const { data: user } = useCurrentUser();
  const { data: campaigns = [] } = useCampaigns();
  const { data: mailboxResponse = { mailboxes: [], meta: { total: 0 } } } = useMailboxes();
  const { pagination: contactsPagination } = useAllContacts({ limit: 1 });

  const navItems = useMemo(
    () => {
      const items = [
        { icon: LayoutDashboard, label: t('common.dashboard', 'Dashboard'),        path: '/dashboard' },
        {
          icon: Send,
          label: t('common.email_campaigns', 'Email Campaigns'),
          path: '/dashboard/campaigns',
          badge: campaigns.length > 0 ? campaigns.length.toString() : null,
        },
        {
          icon: Mailbox,
          label: t('common.email_accounts', 'Email Accounts'),
          path: '/dashboard/mailboxes',
          badge: mailboxResponse.meta?.total > 0 ? mailboxResponse.meta.total.toString() : null,
        },
        {
          icon: Users,
          label: t('common.contacts', 'Contacts'),
          path: '/dashboard/audience',
          badge: contactsPagination.total > 0 ? contactsPagination.total.toString() : null,
        },
        { icon: Zap,       label: t('common.crm', 'CRM'),               path: '/dashboard/crm' },
        { icon: BarChart3, label: t('common.global_analytics', 'Analytics'), path: '/dashboard/analytics' },
        { icon: Link2,     label: t('common.integrations', 'Integrations'), path: '/dashboard/integrations' },
        { icon: Settings,  label: t('common.settings', 'Settings'),     path: '/dashboard/settings' },
      ];

      if (user?.role === 'admin') {
        items.push({ icon: ShieldCheck, label: t('common.admin_panel', 'Admin Panel'), path: '/dashboard/admin' });
      }

      return items;
    },
    [t, campaigns.length, mailboxResponse.meta, contactsPagination.total, user?.role],
  );


  // Build breadcrumb segments from the URL path
  const breadcrumbs = useMemo(() => {
    const segments = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', path: '/dashboard', icon: Home }];
    let built = '';
    segments.forEach((seg) => {
      built += '/' + seg;
      // Try to find a nav item that matches
      const match = navItems.find((n) => n.path === built);
      const label = match
        ? match.label
        : seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
      crumbs.push({ label, path: built });
    });
    // Remove duplicate home if already on /dashboard
    if (crumbs.length > 1 && crumbs[1]?.path === '/dashboard') crumbs.shift();
    return crumbs;
  }, [location.pathname, navItems]);

  return (
    <div className="h-screen w-full overflow-hidden bg-[#FAFAFA] text-zinc-900 selection:bg-purple-100 selection:text-purple-900 font-sans flex overflow-x-hidden">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        navItems={navItems}
      />

      <div
        className={`transition-all duration-300 ease-in-out flex-1 h-screen flex flex-col min-w-0 ${
          sidebarCollapsed ? 'lg:ltr:pl-[64px] lg:rtl:pr-[64px]' : 'lg:ltr:pl-[240px] lg:rtl:pr-[240px]'
        }`}
      >
        {/* Header */}
        <header className="relative z-60 h-14 px-4 flex items-center justify-between bg-white border-b border-zinc-200 shrink-0">

          {/* Left — sidebar toggle + breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors shrink-0"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
              ) : (
                <PanelLeftClose className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
              )}
            </button>

            {/* Breadcrumbs */}
            <nav className="hidden sm:flex items-center gap-1 min-w-0" aria-label="breadcrumb">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const isFirst = index === 0;
                return (
                  <div key={crumb.path} className="flex items-center gap-1 min-w-0">
                    {index > 0 && (
                      <ChevronRight className="w-3 h-3 text-zinc-300 shrink-0" />
                    )}
                    {isLast ? (
                      <span className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-900 truncate max-w-[180px]">
                        {isFirst && <Home className="w-3.5 h-3.5 text-purple-500 shrink-0" />}
                        {crumb.label}
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate(crumb.path)}
                        className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 hover:text-purple-600 transition-colors truncate max-w-[140px]"
                      >
                        {isFirst && <Home className="w-3 h-3 shrink-0" />}
                        {!isFirst && crumb.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right — global search + actions */}
          <div className="flex items-center gap-3 shrink-0">
            <GlobalSearch />
            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <NotificationDropdown />
            </div>
          </div>
        </header>

        {/* Page content */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full flex-1 main-scroller isolate"
        >
          <div className="p-2 w-full max-w-full mx-auto">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;
