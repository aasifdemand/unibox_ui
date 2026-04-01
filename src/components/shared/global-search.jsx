import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Search,
  Mail,
  Users,
  BarChart3,
  Mailbox,
  Send,
  UserRound,
  TrendingUp,
} from 'lucide-react';
import { useGlobalSearch } from '../../hooks/useSearch';
import { useCampaigns } from '../../hooks/useCampaign';
import { useMailboxes } from '../../hooks/useMailboxes';

// ─── Sub-components ───────────────────────────────────────────────────────────

const SearchSection = ({ label, icon, divider = false, children }) => (
  <div className={divider ? 'border-t border-zinc-100 mt-1 pt-1' : ''}>
    <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
      {icon}
      {label}
    </div>
    {children}
  </div>
);

const ResultRow = ({ icon, iconBg, title, sub, badge, badgeColor = 'text-zinc-400', onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-zinc-50 transition-colors ltr:text-left rtl:text-right group"
  >
    <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${iconBg}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[13px] font-semibold text-zinc-900 truncate">{title}</p>
      {sub && <p className="text-[11px] text-zinc-500 truncate mt-0.5">{sub}</p>}
    </div>
    {badge && (
      <span className={`text-[10px] shrink-0 uppercase tracking-wider mt-1 font-medium ${badgeColor}`}>
        {badge}
      </span>
    )}
  </button>
);

// ─── GlobalSearch ─────────────────────────────────────────────────────────────

const GlobalSearch = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ⌘K shortcut
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setShowResults(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Click outside closes
  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // Elasticsearch results (all 5 types in parallel)
  const {
    messages:  esMessages,
    emails:    esEmails,
    contacts:  esContacts,
    leads:     esLeads,
    campaigns: esCampaigns,
    isLoading: esLoading,
    hasResults: esHasResults,
  } = useGlobalSearch(debouncedSearch);

  // Fallback: local name-match for campaigns & mailboxes (shows even before ES indexes data)
  const { data: campaignsData = [] } = useCampaigns();
  const { data: mailboxResponse = { mailboxes: [] } } = useMailboxes();
  const mailboxes = useMemo(() => mailboxResponse.mailboxes || [], [mailboxResponse.mailboxes]);

  const localResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase();
    return [
      ...campaignsData
        .filter((c) => c.name?.toLowerCase().includes(q))
        .map((c) => ({
          id: `c-${c.id}`,
          icon: <Mail className="w-4 h-4" />,
          iconBg: 'bg-zinc-100 border-zinc-200 text-zinc-500',
          title: c.name,
          sub: t('common.campaign_singular', 'Campaign'),
          path: `/dashboard/campaigns/${c.id}`,
        })),
      ...mailboxes
        .filter((m) => m.email?.toLowerCase().includes(q) || m.displayName?.toLowerCase().includes(q))
        .map((m) => ({
          id: `m-${m.id}`,
          icon: <Mailbox className="w-4 h-4" />,
          iconBg: 'bg-zinc-100 border-zinc-200 text-zinc-500',
          title: m.displayName || m.email,
          sub: t('common.mailbox_singular', 'Email Account'),
          path: '/dashboard/mailboxes',
        })),
    ].slice(0, 6);
  }, [searchQuery, campaignsData, mailboxes, t]);

  const showDropdown = showResults && searchQuery.trim().length >= 2;

  const go = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowResults(false);
  };

  // Divider helpers — show only if an earlier section has results
  const dividerFor = (...prev) => prev.some((arr) => arr.length > 0);

  return (
    <div className="hidden lg:flex relative group" ref={containerRef}>
      {/* Input */}
      <Search className="absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 group-focus-within:text-orange-500 transition-colors pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
        onFocus={() => setShowResults(searchQuery.length > 0)}
        placeholder={`${t('common.search', 'Search')}...`}
        className="ltr:pl-9 ltr:pr-14 rtl:pr-9 rtl:pl-14 h-10 w-[200px] xl:w-[280px] bg-zinc-100 border border-transparent rounded-md text-[13px] text-zinc-900 placeholder:text-zinc-500 focus:bg-white focus:border-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-100 shadow-sm transition-all"
      />
      <div className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60 pointer-events-none">
        <span className="px-1 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-medium text-zinc-500 leading-none">⌘</span>
        <span className="px-1 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-medium text-zinc-500 leading-none">K</span>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full ltr:left-0 rtl:right-0 w-[440px] mt-1 bg-white rounded-lg shadow-xl border border-zinc-200 py-2 z-50 max-h-[520px] overflow-y-auto">

          {/* Spinner */}
          {esLoading && (
            <div className="px-4 py-6 flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-[11px] text-zinc-400">Searching everything...</span>
            </div>
          )}

          {/* ── Inbox Messages ── */}
          {!esLoading && esMessages.length > 0 && (
            <SearchSection label="Inbox Messages" icon={<Mailbox className="w-3 h-3" />}>
              {esMessages.map((msg) => (
                <ResultRow
                  key={msg.id}
                  icon={<Mail className="w-3.5 h-3.5" />}
                  iconBg="bg-orange-50 border-orange-100 text-orange-600"
                  title={
                    msg._highlights?.subject?.[0]
                      ? <span dangerouslySetInnerHTML={{ __html: msg._highlights.subject[0]
                          .replace(/<em>/g,  '<mark class="bg-orange-100 text-orange-800 not-italic">')
                          .replace(/<\/em>/g, '</mark>') }} />
                      : (msg.subject || '(no subject)')
                  }
                  sub={msg.from || msg.snippet || ''}
                  badge={msg.senderType}
                  onClick={() => go('/dashboard/mailboxes')}
                />
              ))}
            </SearchSection>
          )}

          {/* ── Campaign Emails ── */}
          {!esLoading && esEmails.length > 0 && (
            <SearchSection label="Campaign Emails" icon={<Send className="w-3 h-3" />} divider={dividerFor(esMessages)}>
              {esEmails.map((email) => (
                <ResultRow
                  key={email.id}
                  icon={<Send className="w-3.5 h-3.5" />}
                  iconBg="bg-zinc-50 border-zinc-200 text-zinc-500"
                  title={email.subject || '(no subject)'}
                  sub={`To: ${email.recipientEmail}`}
                  badge={email.status}
                  badgeColor={
                    email.status === 'opened'  ? 'text-green-600'  :
                    email.status === 'replied' ? 'text-blue-600'   :
                    email.status === 'clicked' ? 'text-purple-600' : 'text-zinc-400'
                  }
                  onClick={() => go(`/dashboard/campaigns/${email.campaignId}`)}
                />
              ))}
            </SearchSection>
          )}

          {/* ── Campaigns ── */}
          {!esLoading && esCampaigns.length > 0 && (
            <SearchSection label="Campaigns" icon={<BarChart3 className="w-3 h-3" />} divider={dividerFor(esMessages, esEmails)}>
              {esCampaigns.map((c) => (
                <ResultRow
                  key={c.id}
                  icon={<BarChart3 className="w-3.5 h-3.5" />}
                  iconBg="bg-blue-50 border-blue-100 text-blue-600"
                  title={c.name}
                  sub={c.subject}
                  badge={c.status}
                  badgeColor={
                    c.status === 'running' || c.status === 'sending' ? 'text-green-600' :
                    c.status === 'completed' ? 'text-zinc-400' : 'text-orange-500'
                  }
                  onClick={() => go(`/dashboard/campaigns/${c.id}`)}
                />
              ))}
            </SearchSection>
          )}

          {/* ── Contacts ── */}
          {!esLoading && esContacts.length > 0 && (
            <SearchSection label="Contacts" icon={<Users className="w-3 h-3" />} divider={dividerFor(esMessages, esEmails, esCampaigns)}>
              {esContacts.map((c) => (
                <ResultRow
                  key={c.id}
                  icon={<UserRound className="w-3.5 h-3.5" />}
                  iconBg="bg-teal-50 border-teal-100 text-teal-600"
                  title={c.name || c.normalizedEmail}
                  sub={c.normalizedEmail + (c.company ? ` · ${c.company}` : '')}
                  badge={c.domain}
                  onClick={() => go('/dashboard/audience')}
                />
              ))}
            </SearchSection>
          )}

          {/* ── CRM Leads ── */}
          {!esLoading && esLeads.length > 0 && (
            <SearchSection label="CRM Leads" icon={<TrendingUp className="w-3 h-3" />} divider={dividerFor(esMessages, esEmails, esCampaigns, esContacts)}>
              {esLeads.map((l) => (
                <ResultRow
                  key={l.id}
                  icon={<TrendingUp className="w-3.5 h-3.5" />}
                  iconBg="bg-purple-50 border-purple-100 text-purple-600"
                  title={l.name || l.email}
                  sub={l.email + (l.company ? ` · ${l.company}` : '') + (l.stageName ? ` · ${l.stageName}` : '')}
                  badge={l.value ? `$${Number(l.value).toLocaleString()}` : null}
                  onClick={() => go('/dashboard/crm')}
                />
              ))}
            </SearchSection>
          )}

          {/* ── Fallback local results ── */}
          {!esLoading && !esHasResults && localResults.length > 0 && (
            <SearchSection label={t('common.quick_results', 'Quick Results')}>
              {localResults.map((r) => (
                <ResultRow
                  key={r.id}
                  icon={r.icon}
                  iconBg={r.iconBg}
                  title={r.title}
                  sub={r.sub}
                  onClick={() => go(r.path)}
                />
              ))}
            </SearchSection>
          )}

          {/* ── Empty state ── */}
          {!esLoading && !esHasResults && localResults.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Search className="w-7 h-7 text-zinc-200 mx-auto mb-2" />
              <p className="text-[13px] text-zinc-400">
                No results for{' '}
                <strong className="text-zinc-600">&ldquo;{searchQuery}&rdquo;</strong>
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">Try a different keyword or check spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
