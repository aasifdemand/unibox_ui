import React, { useState } from 'react';
import { Mail, Users, Globe, Plus, Trash2, Loader2, ExternalLink, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Pagination from '../../../../components/ui/pagination';

const ResourcesTab = ({ senders, batches, campaigns, loading, onDeleteSender }) => {
  const { t } = useTranslation();
  const [subTab, setSubTab] = useState('senders');
  const [pages, setPages] = useState({
    senders: 1,
    lists: 1,
    campaigns: 1,
  });

  const ITEMS_PER_PAGE = 6;

  const handlePageChange = (tab, page) => {
    setPages((prev) => ({ ...prev, [tab]: page }));
  };

  const getPaginatedData = (data, tab) => {
    const startIndex = (pages[tab] - 1) * ITEMS_PER_PAGE;
    return data.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
      case 'completed':
      case 'sent':
        return 'bg-purple-50 text-purple-600 border-purple-100/50';
      case 'pending':
      case 'scheduled':
        return 'bg-amber-50 text-amber-600 border-amber-100/50';
      case 'failed':
      case 'bounced':
        return 'bg-purple-50 text-purple-600 border-purple-100/50';
      case 'draft':
        return 'bg-slate-50 text-slate-500 border-slate-100/50';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100/50';
    }
  };

  const resourceTabs = [
    {
      id: 'senders',
      label: t('settings.resources.tabs.senders'),
      icon: Mail,
      count: senders.length,
    },
    { id: 'lists', label: t('settings.resources.tabs.lists'), icon: Users, count: batches.length },
    {
      id: 'campaigns',
      label: t('settings.resources.tabs.campaigns'),
      icon: Globe,
      count: campaigns.length,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-6 border-b border-slate-50">
        <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-600" />
          {t('settings.resources.title', 'Workspace Resources')}
        </h3>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
          {t('settings.resources.subtitle', 'Manage your senders, contact lists, and outreach campaigns.')}
        </p>
      </div>

      {/* Sub-Tab Navigation - Elite Minimalist */}
      <div className="px-8 pt-6">
        <div className="flex items-center gap-1.5 p-1 bg-slate-50 border border-slate-200 rounded-lg w-fit">
          {resourceTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2.5 h-9 px-4 rounded-md text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${
                subTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm border border-slate-200'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
              }`}
            >
              <tab.icon
                className={`w-3.5 h-3.5 ${subTab === tab.id ? 'text-purple-600' : 'text-slate-400'}`}
              />
              <span>{tab.label}</span>
              <span
                className={`flex items-center justify-center min-w-5 h-5 px-1.5 text-[8px] rounded-full font-black ${
                  subTab === tab.id ? 'bg-purple-50 text-purple-600' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        {/* Senders Content */}
        {subTab === 'senders' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-800 tracking-tight">
                  {t('settings.resources.senders.title')}
                </h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                  {t('settings.resources.senders.subtitle')}
                </p>
              </div>
              <Link
                to="/dashboard/audience?sender=true"
                className="flex items-center gap-2 h-10 px-5 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/10 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> {t('settings.resources.senders.add')}
              </Link>
            </div>

            {loading.senders ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 opacity-20" />
              </div>
            ) : senders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getPaginatedData(senders, 'senders').map((sender) => (
                  <div
                    key={sender.id}
                    className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-white hover:border-purple-200 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-purple-600 shadow-xs">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate tracking-tight">
                            {sender.email}
                          </p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5 opacity-70">
                            {sender.type}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteSender(sender.id)}
                        className="p-2 text-slate-300 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('settings.resources.senders.none')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lists Content */}
        {subTab === 'lists' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-800 tracking-tight">
                  {t('settings.resources.lists.title')}
                </h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  {t('settings.resources.lists.subtitle')}
                </p>
              </div>
              <Link
                to="/dashboard/audience"
                className="flex items-center gap-2 h-10 px-5 bg-purple-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/10 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> {t('settings.resources.lists.add')}
              </Link>
            </div>

            {loading.batches ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 opacity-20" />
              </div>
            ) : batches.length > 0 ? (
              <div className="space-y-2">
                {getPaginatedData(batches, 'lists').map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/30 hover:border-purple-200 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-slate-700 tracking-tight truncate max-w-[200px]">
                        {batch.originalFilename}
                      </span>
                    </div>
                    <span
                      className={`text-[8px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest border ${getStatusColor(batch.status)}`}
                    >
                      {t(`settings.resources.status.${batch.status}`)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('settings.resources.lists.none')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Campaigns Content */}
        {subTab === 'campaigns' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-800 tracking-tight">
                  {t('settings.resources.campaigns.title')}
                </h4>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  {t('settings.resources.campaigns.subtitle')}
                </p>
              </div>
              <Link
                to="/dashboard/campaigns"
                className="flex items-center gap-2 h-10 px-5 bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" /> {t('settings.resources.campaigns.view')}
              </Link>
            </div>

            {loading.campaigns ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600 opacity-20" />
              </div>
            ) : campaigns.length > 0 ? (
              <div className="space-y-2">
                {getPaginatedData(campaigns, 'campaigns').map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-slate-100 bg-slate-50/30 hover:border-purple-200 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-purple-500 shadow-xs">
                        <Globe className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black text-slate-700 tracking-tight uppercase">
                        {campaign.name}
                      </span>
                    </div>
                    <span
                      className={`text-[8px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest border ${getStatusColor(campaign.status)}`}
                    >
                      {t(`settings.resources.status.${campaign.status}`)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('settings.resources.campaigns.none')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Pagination - High Density */}
        <div className="mt-8 pt-6 border-t border-slate-50 flex justify-center">
          {subTab === 'senders' && senders.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={pages.senders}
              totalItems={senders.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(p) => handlePageChange('senders', p)}
            />
          )}
          {subTab === 'lists' && batches.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={pages.lists}
              totalItems={batches.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(p) => handlePageChange('lists', p)}
            />
          )}
          {subTab === 'campaigns' && campaigns.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={pages.campaigns}
              totalItems={campaigns.length}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(p) => handlePageChange('campaigns', p)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesTab;
