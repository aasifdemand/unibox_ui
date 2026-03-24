import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { CheckCircle2, RefreshCw, X, Layout, Layers, Search } from 'lucide-react';
import {
  useIntegrations,
  useConnectIntegration,
  useDisconnectIntegration,
  useSyncIntegration,
} from '../../../hooks/useIntegrations';
import Dialog from '../../../components/ui/dialog';
import { SkeletonLoader } from '../../../components/ui/loading-spinner';

const Logo = ({ src, alt, className, wrapperClassName }) => {
  const [error, setError] = useState(false);

  return (
    <div className={wrapperClassName}>
      {error ? (
        <Layers className="w-1/2 h-1/2 text-slate-300" />
      ) : (
        <img src={src} alt={alt} className={className} onError={() => setError(true)} />
      )}
    </div>
  );
};

const Integrations = () => {
  const { t } = useTranslation();

  const INTEGRATIONS = [
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: t('integrations.apps.hubspot.desc', 'Sync your leads and activities with HubSpot CRM using a 1-click connecting OAuth flow.'),
      logo: 'https://www.vectorlogo.zone/logos/hubspot/hubspot-ar21.svg',
      color: '#ff7a59',
      type: 'crm',
      status: 'disconnected',
      authType: 'oauth',
      docs: 'https://developers.hubspot.com/docs/api/overview',
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: t('integrations.apps.salesforce.desc', 'Connect your enterprise workflows with the Salesforce Web Server flow.'),
      logo: 'https://www.vectorlogo.zone/logos/salesforce/salesforce-ar21.svg',
      color: '#00a1e0',
      type: 'crm',
      status: 'disconnected',
      authType: 'oauth',
      docs: 'https://login.salesforce.com/?locale=in',
    },
    {
      id: 'instantly',
      name: 'Instantly',
      description: t('integrations.apps.instantly.desc', 'Connect your Instantly.ai campaigns for seamless outreach sync.'),
      logo: 'https://www.google.com/s2/favicons?domain=instantly.ai&sz=128',
      color: '#e11d48',
      type: 'outreach',
      status: 'disconnected',
      authType: 'api_key',
      docs: 'https://developer.instantly.ai/',
    },
    {
      id: 'apollo',
      name: 'Apollo',
      description: t('integrations.apps.apollo.desc', 'Enrich your leads with Apollo.io B2B database insights.'),
      logo: 'https://www.vectorlogo.zone/logos/apolloio/apolloio-icon.svg',
      color: '#111827',
      type: 'data',
      status: 'disconnected',
      authType: 'api_key',
      docs: 'https://developer.apollo.io/',
    },
    {
      id: 'leadmagic',
      name: 'Leadmagic',
      description: t('integrations.apps.leadmagic.desc', 'Enrich leads with firmographic data via the Leadmagic X-API-Key.'),
      logo: 'https://www.google.com/s2/favicons?domain=leadmagic.io&sz=128',
      color: '#8b5cf6',
      type: 'data',
      status: 'disconnected',
      authType: 'api_key',
      docs: 'https://docs.leadmagic.io/',
    },
    {
      id: 'clay',
      name: 'Clay',
      description: t('integrations.apps.clay.desc', 'Sync outbound data to Clay tables via their JSON HTTP API.'),
      logo: 'https://www.google.com/s2/favicons?domain=clay.com&sz=128',
      color: '#000000',
      type: 'data',
      status: 'disconnected',
      authType: 'api_key',
      docs: 'https://www.clay.com/docs',
    },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVerifyingOAuth, setIsVerifyingOAuth] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(null);
  const [isSyncing, setIsSyncing] = useState(null);
  const [integrationToDisconnect, setIntegrationToDisconnect] = useState(null);

  const { data: connectedIntegrations = [], isLoading } = useIntegrations();
  const connectMutation = useConnectIntegration();
  const disconnectMutation = useDisconnectIntegration();
  const syncMutation = useSyncIntegration();

  const filteredIntegrations = INTEGRATIONS.map((item) => {
    const connectedInt = connectedIntegrations.find((ci) => ci.service === item.id);
    return {
      ...item,
      status: connectedInt ? 'connected' : 'disconnected',
      lastSyncAt: connectedInt?.lastSyncAt || null,
    };
  }).filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleConnect = async (integration) => {
    const isConnected = connectedIntegrations.find((ci) => ci.service === integration.id);

    if (isConnected) {
      setIntegrationToDisconnect(integration);
      return;
    }

    if (integration.authType === 'oauth') {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
      window.location.href = `${apiUrl}/integrations/oauth/${integration.id}`;
    } else {
      setSelectedIntegration(integration);
      setIsVerifyingOAuth(false);
    }
  };

  const handleSync = async (integration) => {
    setIsSyncing(integration.id);
    const toastId = toast.loading(
      t('integrations.syncing', {
        name: integration.name,
        defaultValue: `Syncing ${integration.name}...`,
      }),
    );
    try {
      await syncMutation.mutateAsync(integration.id);
      setIsSyncing(null);
      toast.dismiss(toastId);
      toast.success(
        t('integrations.sync_success', {
          name: integration.name,
          defaultValue: `Successfully synced ${integration.name}`,
        }),
      );
    } catch (error) {
      setIsSyncing(null);
      toast.dismiss(toastId);
      toast.error(error.message);
    }
  };

  const confirmDisconnect = async () => {
    if (!integrationToDisconnect) return;

    setIsDisconnecting(integrationToDisconnect.id);
    const toastId = toast.loading(
      t('integrations.disconnecting', { name: integrationToDisconnect.name }),
    );

    try {
      await disconnectMutation.mutateAsync(integrationToDisconnect.id);
      setIsDisconnecting(null);
      setIntegrationToDisconnect(null);
      toast.dismiss(toastId);
      toast.success(t('integrations.disconnect_success', { name: integrationToDisconnect.name }));
    } catch (error) {
      setIsDisconnecting(null);
      toast.dismiss(toastId);
      toast.error(error.message);
    }
  };

  const handleOAuthVerify = async () => {
    setIsConnecting(true);
    try {
      await connectMutation.mutateAsync({
        service: selectedIntegration.id,
        type: selectedIntegration.type,
        authType: 'oauth',
        credentials: { verified: true },
      });
      setIsConnecting(false);
      setSelectedIntegration(null);
      setIsVerifyingOAuth(false);
      toast.success(t('integrations.oauth_success', { name: selectedIntegration.name }));
    } catch (error) {
      setIsConnecting(false);
      toast.error(error.message);
    }
  };

  const handleApiKeySubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return toast.error('Please enter a valid API key');

    setIsConnecting(true);
    try {
      await connectMutation.mutateAsync({
        service: selectedIntegration.id,
        type: selectedIntegration.type,
        authType: 'api_key',
        credentials: { apiKey: apiKey.trim() },
      });
      setIsConnecting(false);
      setSelectedIntegration(null);
      setApiKey('');
      toast.success(t('integrations.api_key_success', { name: selectedIntegration.name }));
    } catch (error) {
      setIsConnecting(false);
      toast.error(error.message);
    }
  };

  if (isLoading && connectedIntegrations.length === 0) {
    return (
      <div className="w-full mx-auto px-4 md:px-8 pb-8 space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-col space-y-2">
            <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-4 w-[400px] bg-slate-100 animate-pulse rounded-lg" />
          </div>
          <div className="h-12 w-full md:w-80 bg-slate-50 animate-pulse rounded-lg border border-slate-100" />
        </div>
        <SkeletonLoader type="card" count={6} />
      </div>
    );
  }

  return (
    <div className="w-full mx-auto px-4 md:px-8 pb-8 space-y-8 animate-in fade-in duration-700">
      {/* Header Aligned with Campaigns */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            {t('integrations.header_title')} <span className="ml-2">{t('integrations.header_subtitle')}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 max-w-2xl">
            {t('integrations.header_desc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
            <input
              type="text"
              placeholder={t('integrations.search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full md:w-80 pl-11 pr-4 bg-white border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all shadow-sm group-hover:border-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Integration Grid - Refined Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIntegrations.map((item) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[12px] border border-[#f0f0f0] shadow-[0px_4px_16px_rgba(0,0,0,0.02)] hover:shadow-[0px_8px_24px_rgba(0,0,0,0.06)] transition-all flex flex-col relative overflow-hidden h-full"
          >
            {item.status === 'connected' && (
              <div className="absolute top-3 right-3 bg-[#e8f5e9] text-[#2e7d32] text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {t('integrations.connected', 'Connected')}
              </div>
            )}

            <div className="p-8 pb-7 flex-1 flex flex-col items-center text-center">
              {/* Logo */}
              <div className="w-[64px] h-[64px] flex items-center justify-center mb-5">
                <Logo
                  src={item.logo}
                  alt={item.name}
                  wrapperClassName="w-full h-full flex items-center justify-center p-1"
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Title */}
              <h3 className="text-[17px] font-bold text-[#1a202c] mb-3">{item.name}</h3>

              {/* Description */}
              <p className="text-[#64748b] text-[13px] font-normal leading-[1.6] mb-6 flex-1 px-2">
                {item.description}
              </p>

              {/* Learn How or Last Synced */}
              {item.status === 'connected' ? (
                <div
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#64748b] cursor-pointer hover:text-[#e11d48]"
                  onClick={() => handleSync(item)}
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isSyncing === item.id ? 'animate-spin text-[#e11d48]' : ''}`}
                  />
                  {item.lastSyncAt
                    ? new Date(item.lastSyncAt).toLocaleDateString()
                    : t('integrations.never_synced', 'Never Synced')}
                </div>
              ) : (
                <a
                  href={item.docs}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[13px] font-medium text-[#64748b] hover:text-[#e11d48] transition-colors"
                >
                  <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="w-2.5 h-2.5 ml-[1px]"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </span>
                  {t('integrations.learn_how', 'Learn How')}
                </a>
              )}
            </div>

            {/* Footer Line & Action */}
            <div className="border-t border-[#f0f0f0] w-full">
              <button
                onClick={() => handleConnect(item)}
                disabled={isDisconnecting === item.id}
                className={`w-full py-4 text-[14px] font-semibold flex items-center justify-center transition-colors disabled:opacity-50 ${
                  item.status === 'connected'
                    ? 'text-[#ef4444] hover:bg-[#fef2f2]'
                    : 'text-[#e11d48] hover:bg-[#f8f9ff]'
                }`}
              >
                {isDisconnecting === item.id
                  ? t('integrations.disconnecting_btn')
                  : item.status === 'connected'
                    ? t('integrations.disconnect_btn', 'Disconnect')
                    : t('integrations.connect_app', '+ Connect App')}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredIntegrations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center shadow-sm mb-6">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">
            {t('integrations.no_results')}
          </h3>
          <p className="text-slate-400 text-sm font-medium">{t('integrations.stay_tuned')}</p>
        </div>
      )}

      {/* API Key Modal - Refined Style */}
      <AnimatePresence>
        {selectedIntegration && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIntegration(null)}
              className="absolute inset-0 bg-slate-900/40 "
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-lg overflow-hidden shadow-sm border border-slate-100"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <Logo
                      src={selectedIntegration.logo}
                      alt={selectedIntegration.name}
                      wrapperClassName="w-14 h-14 rounded-lg flex items-center justify-center bg-white border border-slate-100 p-2 shadow-md"
                      className="w-full h-full object-contain"
                    />
                    <div>
                      <h2 className="text-xl font-black text-slate-800 tracking-tight leading-none">
                        {t('integrations.connect_btn')} {selectedIntegration.name}
                      </h2>
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <Layout className="w-3 h-3" /> {t('integrations.secure', 'Secure')}{' '}
                        {selectedIntegration.authType.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedIntegration(null)}
                    className="w-8 h-8 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isVerifyingOAuth) handleOAuthVerify();
                    else handleApiKeySubmit(e);
                  }}
                  className="space-y-8"
                >
                  <div className="space-y-6">
                    {isVerifyingOAuth ? (
                      <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-sm font-bold text-slate-800 mb-2">
                          {t('integrations.complete_auth', 'Complete {{name}} Authorization', { name: selectedIntegration.name })}
                        </p>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                          {t('integrations.verify_oauth_desc', { name: selectedIntegration.name })}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                          {t('integrations.api_key_label')}
                        </label>
                        <input
                          type="password"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder={t('integrations.api_key_placeholder', {
                            name: selectedIntegration.name,
                          })}
                          className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                        />
                      </div>
                    )}

                    {!isVerifyingOAuth && (
                      <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100/50">
                        <p className="text-xs text-orange-600/80 font-medium leading-relaxed">
                          {t('integrations.api_key_desc', { name: selectedIntegration.name })}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isConnecting || (!isVerifyingOAuth && !apiKey.trim())}
                    className="w-full h-14 bg-orange-600 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-sm shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {t('integrations.verifying_btn')}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        {isVerifyingOAuth
                          ? t('integrations.complete_connection')
                          : t('integrations.verify_btn')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Disconnect Modal */}
      {integrationToDisconnect && (
        <Dialog
          open={!!integrationToDisconnect}
          setOpen={(isOpen) => !isOpen && setIntegrationToDisconnect(null)}
          title={t('integrations.confirm_disconnect_title', 'Confirm Disconnection')}
          description={
            <>
              {t('integrations.confirm_disconnect_desc1', 'Are you sure you want to disconnect ')}<strong>{integrationToDisconnect.name}</strong>{t('integrations.confirm_disconnect_desc2', '? Unibox will no longer be able to sync leads or data with this service.')}
            </>
          }
          confirmText={t('integrations.disconnect_btn')}
          cancelText={t('common.cancel')}
          confirmVariant="danger"
          isLoading={isDisconnecting === integrationToDisconnect.id}
          onConfirm={confirmDisconnect}
          onCancel={() => setIntegrationToDisconnect(null)}
        />
      )}

      <div className="pt-10 border-t border-slate-100 text-center pb-12">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] mb-6">
          {t('integrations.upcoming_connections', 'Upcoming Connections')}
        </p>
        <div className="flex flex-wrap justify-center gap-10 opacity-30 grayscale pointer-events-none">
          {['Pipedrive', 'Zendesk', 'Apollo', 'Instantly'].map((logo) => (
            <span
              key={logo}
              className="text-xl font-black text-slate-400 tracking-tighter uppercase"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Integrations;
