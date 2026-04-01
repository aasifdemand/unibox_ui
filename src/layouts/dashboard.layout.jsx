import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
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
    () => [
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
    ],
    [t, campaigns.length, mailboxResponse.meta, contactsPagination.total],
  );

  const activeItem = useMemo(
    () =>
      navItems.find((item) => {
        if (item.path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(item.path);
      }) || { label: t('common.system'), icon: LayoutDashboard },
    [location.pathname, navItems, t],
  );

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAFAFA] text-zinc-900 selection:bg-orange-100 selection:text-orange-900 font-sans">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        navItems={navItems}
      />

      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ltr:pl-[64px] lg:rtl:pr-[64px]' : 'lg:ltr:pl-[240px] lg:rtl:pr-[240px]'
        }`}
      >
        {/* Header */}
        <header className="h-14 px-4 flex items-center justify-between bg-white border-b border-zinc-200 shrink-0">

          {/* Left — sidebar toggle + breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
              ) : (
                <PanelLeftClose className={`w-4 h-4 ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
              )}
            </button>

            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-md bg-orange-600 text-white shadow-sm shrink-0">
                <activeItem.icon className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest leading-none">
                    {t('common.navigation')} /
                  </span>
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest leading-none">
                    {user?.name || t('common.admin', 'Admin')}
                  </span>
                </div>
                <h1 className="text-[15px] font-bold text-zinc-900 tracking-tight leading-none mt-1 truncate">
                  {activeItem.label}
                </h1>
              </div>
            </div>
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
          className="w-full flex-1 overflow-y-auto custom-scrollbar"
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
