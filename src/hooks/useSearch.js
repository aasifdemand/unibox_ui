import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const searchKeys = {
  all:       ['search'],
  messages:  (q, opts) => [...searchKeys.all, 'messages',  q, opts],
  emails:    (q, opts) => [...searchKeys.all, 'emails',    q, opts],
  contacts:  (q, opts) => [...searchKeys.all, 'contacts',  q, opts],
  leads:     (q, opts) => [...searchKeys.all, 'leads',     q, opts],
  campaigns: (q, opts) => [...searchKeys.all, 'campaigns', q, opts],
};

// ─── Fetch helpers ────────────────────────────────────────────────────────────

const fetchSearch = async (path, params) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();
  const res  = await apiClient(`/search/${path}?${qs}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Search failed');
  return data.data;
};

// ─── Individual Hooks ─────────────────────────────────────────────────────────

export const useSearchMessages = ({ query, senderId, page = 1, limit = 10 } = {}) =>
  useQuery({
    queryKey: searchKeys.messages(query, { senderId, page, limit }),
    queryFn:  () => fetchSearch('messages', { q: query, senderId, page, limit }),
    enabled:  Boolean(query && query.trim().length >= 2),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useSearchEmails = ({ query, campaignId, status, page = 1, limit = 10 } = {}) =>
  useQuery({
    queryKey: searchKeys.emails(query, { campaignId, status, page, limit }),
    queryFn:  () => fetchSearch('emails', { q: query, campaignId, status, page, limit }),
    enabled:  Boolean(query && query.trim().length >= 2),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useSearchContacts = ({ query, status, page = 1, limit = 10 } = {}) =>
  useQuery({
    queryKey: searchKeys.contacts(query, { status, page, limit }),
    queryFn:  () => fetchSearch('contacts', { q: query, status, page, limit }),
    enabled:  Boolean(query && query.trim().length >= 2),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useSearchLeads = ({ query, stageId, page = 1, limit = 10 } = {}) =>
  useQuery({
    queryKey: searchKeys.leads(query, { stageId, page, limit }),
    queryFn:  () => fetchSearch('leads', { q: query, stageId, page, limit }),
    enabled:  Boolean(query && query.trim().length >= 2),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useSearchCampaigns = ({ query, status, page = 1, limit = 10 } = {}) =>
  useQuery({
    queryKey: searchKeys.campaigns(query, { status, page, limit }),
    queryFn:  () => fetchSearch('campaigns', { q: query, status, page, limit }),
    enabled:  Boolean(query && query.trim().length >= 2),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

// ─── Unified Global Search ────────────────────────────────────────────────────
/**
 * Runs all 5 search queries in parallel.
 * Returns aggregated results with per-section totals and a combined loading state.
 */
export const useGlobalSearch = (query) => {
  const isEnabled = Boolean(query && query.trim().length >= 2);
  const opts = { query };

  const messagesQ  = useSearchMessages({ ...opts, limit: 4 });
  const emailsQ    = useSearchEmails({ ...opts, limit: 4 });
  const contactsQ  = useSearchContacts({ ...opts, limit: 4 });
  const leadsQ     = useSearchLeads({ ...opts, limit: 4 });
  const campaignsQ = useSearchCampaigns({ ...opts, limit: 4 });

  const isLoading  = isEnabled && (
    messagesQ.isLoading  || emailsQ.isLoading  ||
    contactsQ.isLoading  || leadsQ.isLoading   || campaignsQ.isLoading
  );
  const isFetching = isEnabled && (
    messagesQ.isFetching || emailsQ.isFetching ||
    contactsQ.isFetching || leadsQ.isFetching  || campaignsQ.isFetching
  );

  const messages  = messagesQ.data?.results  || [];
  const emails    = emailsQ.data?.results    || [];
  const contacts  = contactsQ.data?.results  || [];
  const leads     = leadsQ.data?.results     || [];
  const campaigns = campaignsQ.data?.results || [];

  const hasResults =
    messages.length > 0  || emails.length > 0   ||
    contacts.length > 0  || leads.length > 0     || campaigns.length > 0;

  return {
    messages,  messagesTotal:  messagesQ.data?.total  || 0,
    emails,    emailsTotal:    emailsQ.data?.total    || 0,
    contacts,  contactsTotal:  contactsQ.data?.total  || 0,
    leads,     leadsTotal:     leadsQ.data?.total     || 0,
    campaigns, campaignsTotal: campaignsQ.data?.total || 0,
    isLoading,
    isFetching,
    hasResults,
    isEnabled,
  };
};
