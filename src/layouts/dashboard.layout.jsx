import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Mail,
  Users,
  BarChart3,
  Settings,
  Search,
  Zap,
  Mailbox,
  PanelLeftClose,
  PanelLeftOpen,
  Link2,
  Send,
} from 'lucide-react';
import Sidebar from '../components/shared/sidebar';
import LanguageSwitcher from '../components/shared/language-switcher';
import { useCurrentUser } from '../hooks/useAuth';
import { useCampaigns } from '../hooks/useCampaign';
import { useMailboxes } from '../hooks/useMailboxes';
import { useAllContacts } from '../routes/dashboard/audience/hooks/use-all-contacts';
import { useSocketEvents } from '../hooks/useSocketEvents';
import NotificationDropdown from '../components/shared/notification-dropdown';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
  const { t, i18n } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Keyboard shortcut for Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchResults(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const mailboxes = useMemo(() => mailboxResponse.mailboxes || [], [mailboxResponse.mailboxes]);

  const navItems = [
    { icon: LayoutDashboard, label: t('common.dashboard', 'Dashboard'), path: '/dashboard' },
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
    { icon: Zap, label: t('common.crm', 'CRM'), path: '/dashboard/crm' },
    {
      icon: BarChart3,
      label: t('common.global_analytics', 'Analytics'),
      path: '/dashboard/analytics',
    },
    {
      icon: Link2,
      label: t('common.integrations', 'Integrations'),
      path: '/dashboard/integrations',
    },
    { icon: Settings, label: t('common.settings', 'Settings'), path: '/dashboard/settings' },
  ];

  const activeItem = navItems.find((item) => {
    if (item.path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(item.path);
  }) || { label: t('common.system'), icon: LayoutDashboard };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return [
      ...campaigns
        .filter((c) => c.name?.toLowerCase().includes(query))
        .map((c) => ({
          id: `c-${c.id}`,
          name: c.name,
          type: t('common.campaign_singular', 'Campaign'),
          path: `/dashboard/campaigns/${c.id}`,
          icon: <Mail className="w-4 h-4" />,
        })),
      ...mailboxes
        .filter((m) => m.email?.toLowerCase().includes(query) || m.displayName?.toLowerCase().includes(query))
        .map((m) => ({
          id: `m-${m.id}`,
          name: m.displayName || m.email,
          type: t('common.mailbox_singular', 'Email Account'),
          path: `/dashboard/mailboxes`,
          icon: <Mailbox className="w-4 h-4" />,
        })),
    ].slice(0, 8);
  }, [searchQuery, campaigns, mailboxes,t]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#FAFAFA] text-zinc-900 selection:bg-orange-100 selection:text-orange-900 font-sans">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        navItems={navItems}
      />

      {/* Main Container - aligned with the exact width of tracking sidebars */}
      <div
        className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'lg:ltr:pl-[64px] lg:rtl:pr-[64px]' : 'lg:ltr:pl-[240px] lg:rtl:pr-[240px]'}`}
      >
        {/* Header */}
        <header
          className="h-14 px-4 flex items-center justify-between bg-white border-b border-zinc-200 shrink-0"
        >
          {/* Left: Sidebar Toggle + Breadcrumb */}
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

          {/* Right: Search + Profile + Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search - Unified Command style */}
            <div className="hidden lg:flex relative group" ref={searchRef}>
              <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                placeholder={t('common.search') + '...'}
                className="ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 h-10 w-[200px] xl:w-[280px] bg-zinc-100 border border-transparent rounded-md text-[13px] text-zinc-900 placeholder:text-zinc-500 focus:bg-white focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-100 shadow-sm transition-all"
              />
              <div className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60">
                <span className="px-1 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-medium text-zinc-500 shadow-xs leading-none">
                  ⌘
                </span>
                <span className="px-1 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-medium text-zinc-500 shadow-xs leading-none">
                  K
                </span>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-sm border border-zinc-200 py-2 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    {t('common.quick_results', 'Quick Results')}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          navigate(result.path);
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-zinc-50 transition-colors ltr:text-left rtl:text-right group"
                      >
                        <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center text-zinc-500 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-zinc-900 truncate">{result.name}</p>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mt-0.5">
                            {result.type}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <LanguageSwitcher />
              <NotificationDropdown />
            </div>
          </div>
        </header>

        {/* Intelligence Surface */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full flex-1 overflow-y-auto custom-scrollbar"
        >
          <div className="p-4 w-full">
            <Outlet />
          </div>
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;
