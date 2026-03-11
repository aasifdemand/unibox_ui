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
  Bell,
  Search,
  HelpCircle,
  FileText,
  Zap,
  CreditCard,
  Mailbox,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
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
    console.log('Received real-time notification:', payload);
    const { type = 'info', message, title } = payload;
    const displayText = title ? `${title}: ${message}` : message;

    if (type === 'success') {
      toast.success(displayText);
    } else if (type === 'error') {
      toast.error(displayText);
    } else {
      toast(displayText, {
        icon: '🔔',
      });
    }
  });

  // React Query hooks
  const { data: user } = useCurrentUser();
  const { data: campaigns = [] } = useCampaigns();
  const { data: mailboxResponse = { mailboxes: [], meta: { total: 0 } } } = useMailboxes();
  const { pagination: contactsPagination } = useAllContacts({ limit: 1 }); // Just to get total count

  const mailboxes = useMemo(() => mailboxResponse.mailboxes || [], [mailboxResponse.mailboxes]);

  const navItems = [
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/dashboard' },
    {
      icon: Mailbox,
      label: t('common.mailboxes'),
      path: '/dashboard/mailboxes',
      badge: mailboxResponse.meta?.total > 0 ? mailboxResponse.meta.total.toString() : null,
    },
    {
      icon: Mail,
      label: t('common.campaigns'),
      path: '/dashboard/campaigns',
      badge: campaigns.length > 0 ? campaigns.length.toString() : null,
    },
    {
      icon: Users,
      label: t('common.audience'),
      path: '/dashboard/audience',
      badge: contactsPagination.total > 0 ? contactsPagination.total.toString() : null,
    },
    { icon: BarChart3, label: t('common.analytics'), path: '/dashboard/analytics' },
    { icon: CreditCard, label: t('common.subscription'), path: '/dashboard/subscription' },
    { icon: Settings, label: t('common.settings'), path: '/dashboard/settings' },
  ];

  // Derive active item for breadcrumbs
  const activeItem = navItems.find((item) => {
    if (item.path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(item.path);
  }) || { label: t('common.system'), icon: LayoutDashboard };

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();

    const results = [
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
        .filter(
          (m) =>
            m.email?.toLowerCase().includes(query) || m.displayName?.toLowerCase().includes(query),
        )
        .map((m) => ({
          id: `m-${m.id}`,
          name: m.displayName || m.email,
          type: t('common.mailbox_singular', 'Mailbox'),
          path: `/dashboard/mailboxes`,
          icon: <Mailbox className="w-4 h-4" />,
        })),
    ];

    return results.slice(0, 8);
  }, [searchQuery, campaigns, mailboxes]);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        navItems={navItems}
      />

      {/* Main Framework */}
      <div
        className={`transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'lg:ltr:pl-20 lg:rtl:pr-20' : 'lg:ltr:pl-70 lg:rtl:pr-70'}`}
      >
        {/* Superior Header - High Glassmorphism */}
        <header
          className={`fixed top-0 z-40 h-16 lg:h-20 px-4 lg:px-8 flex items-center justify-between bg-white/40 backdrop-blur-2xl border-b border-slate-200/40 shadow-xs shadow-slate-800/2 transition-all duration-500 ease-in-out ltr:left-0 ltr:right-0 rtl:right-0 rtl:left-0 ${sidebarCollapsed
            ? 'lg:ltr:left-20 lg:rtl:right-20'
            : 'lg:ltr:left-70 lg:rtl:right-70'
            }`}
        >
          {/* Section Indicator with Sidebar Toggle */}
          <div className="flex items-center gap-3 lg:gap-6 min-w-0 flex-1">
            {/* Sidebar Toggle Button - Moved from Sidebar */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100/80 text-slate-500 hover:text-slate-800 transition-all active:scale-90 group relative"
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className={`w-5 h-5 ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
              ) : (
                <PanelLeftClose className={`w-5 h-5 ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`} />
              )}
            </button>

            <div className="flex items-center gap-2 lg:gap-3">
              <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-blue-600 items-center justify-center text-white shadow-lg shadow-slate-800/10 transition-transform hover:rotate-3">
                <activeItem.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="hidden lg:flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                    {t('common.navigation')} /
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-[0.2em] leading-none mb-1">
                    {user?.name}
                  </span>
                </div>
                <h1 className="text-base sm:text-lg lg:text-xl font-extrabold text-slate-800 tracking-tighter leading-none truncate max-w-[130px] sm:max-w-none">
                  {activeItem.label}
                </h1>
              </div>
            </div>


          </div>

          {/* Action Center */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
            {/* Search - Unified Command style */}
            <div className="hidden xl:flex relative group" ref={searchRef}>
              <Search className="absolute ltr:left-4 ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
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
                className="ltr:pl-12 ltr:pr-12 rtl:pl-12 ltr:pr-4 rtl:pl-4 py-2.5 w-[240px] 2xl:w-[320px] bg-slate-100/50 border border-slate-200/60 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 focus:outline-none focus:shadow-2xl focus:shadow-blue-500/5 transition-all duration-300"
              />
              <div className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="px-1.5 py-0.5 rounded-md border border-slate-200 bg-white text-[9px] font-extrabold text-slate-400 shadow-xs leading-none">
                  ⌘
                </span>
                <span className="px-1.5 py-0.5 rounded-md border border-slate-200 bg-white text-[9px] font-extrabold text-slate-400 shadow-xs leading-none">
                  K
                </span>
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full ltr:left-0 ltr:right-0 rtl:left-0 ltr:right-0 rtl:left-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="px-4 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] border-b border-slate-50 mb-2">
                    {t('common.quick_results', 'Quick Results')}
                  </div>
                  <div className="max-h-80 overflow-y-auto px-2 space-y-1">
                    {searchResults.map((result) => (
                      <button
                        key={result.id}
                        onClick={() => {
                          navigate(result.path);
                          setSearchQuery('');
                          setShowSearchResults(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all ltr:text-left ltr:text-right rtl:text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          {result.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{result.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            {result.type}
                          </p>
                        </div>
                        <ChevronRight
                          className={`w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all ${i18n.dir() === 'rtl' ? 'scale-x-[-1]' : ''}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showSearchResults && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full ltr:left-0 ltr:right-0 rtl:left-0 ltr:right-0 rtl:left-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 z-50 text-center animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-800">
                    {t('common.no_results_found', 'No results found')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('common.empty_search_unified', 'Try searching for campaigns or mailboxes')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2 sm:ltr:pr-4 sm:rtl:pl-4 sm:ltr:border-r sm:rtl:border-l border-slate-200/60">
              <LanguageSwitcher />
              <NotificationDropdown />
              <button className="hidden sm:flex w-10 h-10 rounded-xl hover:bg-slate-100/80 items-center justify-center text-slate-500 hover:text-slate-800 transition-all active:scale-90">
                <HelpCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Micro Stats Card */}
            <div className="hidden sm:flex flex-col ltr:text-right rtl:text-left">
              <span className="text-xs font-extrabold text-slate-800 leading-none">
                {user?.name?.split(' ')[0] || 'Aasif'} Inbox
              </span>
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"></div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                  {t('common.active')}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Intelligence Surface */}
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="pt-20 lg:pt-24 px-4 md:px-8 pb-4 md:pb-8 w-full"
        >
          <div className="w-full min-h-[calc(100vh-144px)]">
            <Outlet />
          </div>
        </motion.main>


        {/* Refined Footer */}
        <footer className="px-6 md:px-10 py-6 md:py-8 mt-auto border-t border-slate-200/40 bg-white/30 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 group cursor-pointer">
                <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-500">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-extrabold text-slate-800 tracking-tight">
                  Unibox<span className="text-blue-600">.</span>
                </span>
              </div>
              <div className="w-px h-4 bg-slate-200"></div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em]">
                Engineering v1.0.4
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest text-center md:text-left">
                  Global Status: {t('common.operational')}
                </span>
              </div>
              <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
                <a
                  href="#"
                  className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  {t('common.documentation')}
                </a>
                <a
                  href="#"
                  className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  {t('common.privacy')}
                </a>
                <a
                  href="#"
                  className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                >
                  {t('common.terms')}
                </a>
              </div>
            </div>

            <p className="text-[10px] font-bold text-slate-300 text-center">
              © {new Date().getFullYear()} Unibox Intelligence Labs.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
