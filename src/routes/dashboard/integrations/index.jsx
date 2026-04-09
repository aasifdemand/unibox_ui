/* eslint-disable react-hooks/immutability */
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  RefreshCw, 
  Search, 
  ExternalLink, 
  Box,
  Share2,
  Database,
  Unplug,
  Link2
} from 'lucide-react';
import {
  useIntegrations,
  useConnectIntegration,
  useDisconnectIntegration,
  useSyncIntegration,
} from '../../../hooks/useIntegrations';
import { useCurrentUser } from '../../../hooks/useAuth';
import { formatInTimezone } from '../../../utils/date-utils';
import ConnectIntegration from '../../../modals/connect-integration';
import DisconnectIntegration from '../../../modals/disconnect-integration';

const INTEGRATIONS = [
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync your leads and activities with HubSpot CRM using a 1-click connecting OAuth flow.',
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
    description: 'Connect your enterprise workflows with the Salesforce Web Server flow.',
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
    description: 'Connect your Instantly.ai campaigns for seamless outreach sync.',
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
    description: 'Enrich your leads with Apollo.io B2B database insights.',
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
    description: 'Enrich leads with firmographic data via the Leadmagic X-API-Key.',
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
    description: 'Sync outbound data to Clay tables via their JSON HTTP API.',
    logo: 'https://www.google.com/s2/favicons?domain=clay.com&sz=128',
    color: '#000000',
    type: 'data',
    status: 'disconnected',
    authType: 'api_key',
    docs: 'https://www.clay.com/docs',
  },
];

const Logo = ({ src, alt, className, wrapperClassName }) => {
  const [error, setError] = useState(false);

  return (
    <div className={wrapperClassName}>
      {error ? (
        <Box className="w-1/2 h-1/2 text-slate-300" />
      ) : (
        <img src={src} alt={alt} className={className} onError={() => setError(true)} />
      )}
    </div>
  );
};

const Integrations = () => {


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
  const { data: user } = useCurrentUser();
  const userTz = user?.timezone || 'UTC';

  const filteredIntegrations = INTEGRATIONS.map((item) => {
    const connectedInt = connectedIntegrations.find((ci) => ci.service === item.id);
    return {
      ...item,
      status: connectedInt ? 'connected' : 'disconnected',
      syncStatus: connectedInt?.syncStatus || 'healthy',
      lastError: connectedInt?.lastError || null,
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
    const toastId = toast.loading(`Syncing ${integration.name}...`);
    try {
      await syncMutation.mutateAsync(integration.id);
      setIsSyncing(null);
      toast.dismiss(toastId);
      toast.success(`Successfully synced ${integration.name}`);
    } catch (error) {
      setIsSyncing(null);
      toast.dismiss(toastId);
      toast.error(error.message);
    }
  };

  const confirmDisconnect = async () => {
    if (!integrationToDisconnect) return;

    setIsDisconnecting(integrationToDisconnect.id);
    const toastId = toast.loading(`Disconnecting ${integrationToDisconnect.name}...`);

    try {
      await disconnectMutation.mutateAsync(integrationToDisconnect.id);
      setIsDisconnecting(null);
      setIntegrationToDisconnect(null);
      toast.dismiss(toastId);
      toast.success(`Successfully disconnected ${integrationToDisconnect.name}`);
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
      toast.success(`Successfully connected ${selectedIntegration.name}`);
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
      toast.success(`Successfully connected ${selectedIntegration.name}`);
    } catch (error) {
      setIsConnecting(false);
      toast.error(error.message);
    }
  };

  if (isLoading && connectedIntegrations.length === 0) {
    return (
      <div className="w-full mx-auto px-4 md:px-8 pb-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex flex-col space-y-2">
            <div className="h-8 w-64 bg-slate-200 animate-pulse rounded-lg" />
            <div className="h-4 w-[400px] bg-slate-100 animate-pulse rounded-lg" />
          </div>
          <div className="h-12 w-full md:w-80 bg-slate-50 animate-pulse rounded-lg border border-slate-100" />
        </div>
        <div className="space-y-4">
          {[1,2,3,4].map(i => (
             <div key={i} className="h-16 w-full bg-slate-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto p-4 space-y-8 animate-in fade-in duration-700">
      {/* Search Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Share2 className="w-6 h-6 text-purple-600" />
            Integrations
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Connect your favorite tools to streamline your outreach workflow.
          </p>
        </div>

        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full md:w-80 pl-11 pr-4 bg-white border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-400 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Tabular Layout */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 border-b border-slate-100">
                  Integration
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 border-b border-slate-100">
                  Type
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 border-b border-slate-100">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 border-b border-slate-100">
                  Last Sync
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 border-b border-slate-100 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIntegrations.map((item) => (
                <tr key={item.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-300">
                        <Logo
                          src={item.logo}
                          alt={item.name}
                          wrapperClassName="w-full h-full flex items-center justify-center text-slate-300"
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-900 leading-none mb-1">
                          {item.name}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 max-w-[240px] truncate">
                          {item.description}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-semibold border border-slate-100">
                      <Database className="w-3 h-3" />
                      {item.type}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className={`inline-flex items-center gap-1.5 text-xs font-semibold capitalize ${
                        item.status === 'connected' ? (item.syncStatus === 'error' ? 'text-rose-500' : 'text-purple-600') : 'text-slate-400'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          item.status === 'connected' ? (item.syncStatus === 'error' ? 'bg-rose-500' : 'bg-purple-600 animate-pulse') : 'bg-slate-300'
                        }`} />
                        {item.status === 'connected' && item.syncStatus === 'error' ? 'Sync Error' : item.status}
                      </div>
                      {item.status === 'connected' && item.syncStatus === 'error' && item.lastError && (
                        <span className="text-[10px] font-medium text-rose-400 max-w-[150px] truncate" title={item.lastError}>
                          {item.lastError}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-bold text-slate-400">
                      {item.status === 'connected' ? (
                        item.lastSyncAt ? formatInTimezone(item.lastSyncAt, userTz) : 'Pending'
                      ) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {item.status === 'connected' && (
                        <button
                          onClick={() => handleSync(item)}
                          disabled={isSyncing === item.id}
                          className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all group/sync"
                          title="Sync Now"
                        >
                          <RefreshCw className={`w-4 h-4 ${isSyncing === item.id ? 'animate-spin text-purple-600' : ''}`} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleConnect(item)}
                        disabled={isDisconnecting === item.id}
                        className={`p-2 rounded-lg text-xs font-bold transition-all ${
                          item.status === 'connected'
                            ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                            : 'bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white shadow-sm'
                        }`}
                        title={item.status === 'connected' ? 'Disconnect' : 'Connect'}
                      >
                        {isDisconnecting === item.id ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : item.status === 'connected' ? (
                          <Unplug className="w-4 h-4" />
                        ) : (
                          <Link2 className="w-4 h-4" />
                        )}
                      </button>
                      
                      <a
                        href={item.docs}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg bg-slate-50 text-slate-300 hover:text-slate-600 hover:bg-white transition-all border border-transparent hover:border-slate-100"
                        title="Documentation"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Empty State In-Table */}
        {filteredIntegrations.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Unplug className="w-12 h-12 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No matching apps</h3>
            <p className="text-slate-400 text-xs font-medium">Try searching for a different integration.</p>
          </div>
        )}
      </div>

      {/* Upcoming Banner - Simple */}
      <div className="pt-12 border-t border-slate-100">
        <p className="text-xs font-bold text-slate-400 mb-8 text-center bg-slate-50 inline-block px-4 py-1 rounded-full mx-auto">
          Upcoming Connections
        </p>
        <div className="flex flex-wrap justify-center gap-12 opacity-20 grayscale pointer-events-none pb-12">
          {['Pipedrive', 'Zendesk', 'Outreach', 'ActiveCampaign', 'Zapier'].map((logo) => (
            <span
              key={logo}
              className="text-lg font-bold text-slate-400 tracking-tight"
            >
              {logo}
            </span>
          ))}
        </div>
      </div>

      {/* Modals remain the same as they are shared components */}
      <ConnectIntegration
        isOpen={!!selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
        integration={selectedIntegration}
        apiKey={apiKey}
        setApiKey={setApiKey}
        isConnecting={isConnecting}
        isVerifyingOAuth={isVerifyingOAuth}
        handleApiKeySubmit={handleApiKeySubmit}
        handleOAuthVerify={handleOAuthVerify}
      />

      <DisconnectIntegration
        isOpen={!!integrationToDisconnect}
        setIsOpen={(isOpen) => !isOpen && setIntegrationToDisconnect(null)}
        integration={integrationToDisconnect}
        handleDisconnect={confirmDisconnect}
        isDisconnecting={isDisconnecting === integrationToDisconnect?.id}
      />
    </div>
  );
};

export default Integrations;
