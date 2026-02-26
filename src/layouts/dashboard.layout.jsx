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
import { useTemplates } from '../hooks/useTemplate';
import { useBatches } from '../hooks/useBatches';
import { useMailboxes } from '../hooks/useMailboxes';

const DashboardLayout = () => {
  const { t } = useTranslation();
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

  // React Query hooks
  const { data: user } = useCurrentUser();
  const { data: campaigns = [] } = useCampaigns();
  const { data: templates = [] } = useTemplates();
  const { data: batches = [] } = useBatches();
  const { data: mailboxResponse = { mailboxes: [] } } = useMailboxes();
  const mailboxes = useMemo(() => mailboxResponse.mailboxes || [], [mailboxResponse.mailboxes]);

  const unreadMailCount = mailboxes.reduce((total, mailbox) => {
    return total + (mailbox.unreadCount || 0);
  }, 0);

  const navItems = [
    { icon: LayoutDashboard, label: t('common.dashboard'), path: '/dashboard' },
    { icon: BarChart3, label: t('common.analytics'), path: '/dashboard/analytics' },
    {
      icon: Mailbox,
      label: t('common.mailboxes'),
      path: '/dashboard/mailboxes',
      badge: unreadMailCount > 0 ? unreadMailCount.toString() : null,
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
      badge: batches.length > 0 ? batches.length.toString() : null,
    },
    {
      icon: FileText,
      label: t('common.templates'),
      path: '/dashboard/templates',
      badge: templates.length > 0 ? templates.length.toString() : null,
    },
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
      ...templates
        .filter((tmpl) => tmpl.name?.toLowerCase().includes(query))
        .map((tmpl) => ({
          id: `t-${tmpl.id}`,
          name: tmpl.name,
          type: t('common.template_singular', 'Template'),
          path: `/dashboard/templates`,
          icon: <FileText className="w-4 h-4" />,
        })),
      ...batches
        .filter(
          (b) =>
            b.name?.toLowerCase().includes(query) ||
            b.originalFilename?.toLowerCase().includes(query),
        )
        .map((b) => ({
          id: `b-${b.id}`,
          name: b.name || b.originalFilename,
          type: t('common.audience_singular', 'Audience'),
          path: `/dashboard/audience`,
          icon: <Users className="w-4 h-4" />,
        })),
    ];

    return results.slice(0, 8);
  }, [searchQuery, campaigns, mailboxes, templates, batches]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-900">
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        navItems={navItems}
      />

      {/* Main Framework */}
      <div
        className={`transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'ltr:pl-20 rtl:pr-20' : 'ltr:pl-70 rtl:pr-70'}`}
      >
        {/* Superior Header - High Glassmorphism */}
        <header className="sticky top-0 z-40 h-20 px-8 flex items-center justify-between bg-white/40 backdrop-blur-2xl border-b border-slate-200/40 shadow-xs shadow-slate-800/2">
          {/* Section Indicator with Sidebar Toggle */}
          <div className="flex items-center gap-6">
            {/* Sidebar Toggle Button - Moved from Sidebar */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-slate-100/80 text-slate-500 hover:text-slate-800 transition-all active:scale-90 group relative"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="w-5 h-5" />
              ) : (
                <PanelLeftClose className="w-5 h-5" />
              )}
              <span className="absolute -bottom-8 ltr:left-1/2 ltr:right-1/2 rtl:left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {sidebarCollapsed ? 'Expand sidebar (⌘+B)' : 'Collapse sidebar (⌘+B)'}
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-slate-800/10 transition-transform hover:rotate-3">
                <activeItem.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">
                    {t('common.navigation')} /
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-[0.2em] leading-none mb-1">
                    {user?.name}
                  </span>
                </div>
                <h1 className="text-xl font-extrabold text-slate-800 tracking-tighter leading-none">
                  {activeItem.label}
                </h1>
              </div>
            </div>

            <div className="hidden lg:flex items-center h-8 px-4 ltr:border-l ltr:border-r rtl:border-l border-slate-200 ltr:ml-2 ltr:mr-2 rtl:ml-2">
              <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1 rounded-full border border-blue-100/50 transition-all hover:bg-blue-50">
                <Zap className="w-3.5 h-3.5 text-blue-500" />
                <span className="text-[10px] font-extrabold text-blue-700 uppercase tracking-widest whitespace-nowrap">
                  {t('common.live_monitoring')}
                </span>
              </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="flex items-center gap-6">
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
                placeholder={t('common.search') + "..."}
                className="ltr:pl-12 ltr:pr-12 rtl:pl-12 ltr:pr-4 rtl:pl-4 py-2.5 w-[320px] bg-slate-100/50 border border-slate-200/60 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/50 focus:outline-none focus:shadow-2xl focus:shadow-blue-500/5 transition-all duration-300"
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
                        <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
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
                  <p className="text-sm font-bold text-slate-800">{t('common.no_results_found', 'No results found')}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('common.empty_search_unified', 'Try searching for campaigns or mailboxes')}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 ltr:pr-4 rtl:pl-4 ltr:border-r rtl:border-l border-slate-200/60">
              <LanguageSwitcher />
              <button className="w-10 h-10 rounded-xl hover:bg-slate-100/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all active:scale-90 group relative">
                <Bell className="w-5 h-5" />
                {unreadMailCount > 0 && (
                  <span className="absolute top-2 ltr:right-2 rtl:left-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                )}
              </button>
              <button className="w-10 h-10 rounded-xl hover:bg-slate-100/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-all active:scale-90">
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
          className="p-4 md:p-8 w-full"
        >
          <div className="w-full min-h-[calc(100vh-144px)]">
            <Outlet />
          </div>
        </motion.main>

        {/* Refined Footer */}
        <footer className="px-10 py-8 mt-auto border-t border-slate-200/40 bg-white/30 backdrop-blur-sm">
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

            <div className="flex items-center gap-10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                <span className="text-[10px] font-extrabold text-slate-600 uppercase tracking-widest">
                  Global Status: {t('common.operational')}
                </span>
              </div>
              <div className="flex items-center gap-6">
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

            <p className="text-[10px] font-bold text-slate-300">
              © {new Date().getFullYear()} Unibox Intelligence Labs.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
