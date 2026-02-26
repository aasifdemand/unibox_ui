import React, { useState } from 'react';
import {
  Mail,
  MessageSquare,
  Users,
  Globe,
  Plus,
  Trash2,
  Loader2,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import Pagination from '../../../../components/ui/pagination';

const ResourcesTab = ({
  senders,
  templates,
  batches,
  campaigns,
  loading,
  onDeleteSender,
  onDeleteTemplate,
}) => {
  const { t } = useTranslation();
  const [subTab, setSubTab] = useState('senders');
  const [pages, setPages] = useState({
    senders: 1,
    templates: 1,
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
        return 'bg-emerald-50 text-emerald-600 border-emerald-100/50';
      case 'pending':
      case 'scheduled':
        return 'bg-amber-50 text-amber-600 border-amber-100/50';
      case 'failed':
      case 'bounced':
        return 'bg-rose-50 text-rose-600 border-rose-100/50';
      case 'draft':
        return 'bg-slate-50 text-slate-500 border-slate-100/50';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100/50';
    }
  };

  const resourceTabs = [
    { id: 'senders', label: t('settings.resources.tabs.senders'), icon: Mail, count: senders.length },
    {
      id: 'templates',
      label: t('settings.resources.tabs.templates'),
      icon: MessageSquare,
      count: templates.length,
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col h-full"
    >
      {/* Sub Tabs */}
      <div className="px-10 pt-10">
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 border border-slate-100 rounded-4xl w-fit shadow-sm">
          {resourceTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2.5 py-2.5 px-6 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${subTab === tab.id
                ? 'bg-white text-blue-600 shadow-md shadow-slate-900/5'
                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                }`}
            >
              <tab.icon
                className={`w-3.5 h-3.5 ${subTab === tab.id ? 'text-blue-600' : 'text-slate-400'}`}
              />
              <span>{tab.label}</span>
              <span
                className={`flex items-center justify-center min-w-5 h-5 px-1.5 text-[8px] rounded-full font-black ${subTab === tab.id ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                  }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-10 py-10">
        {/* Senders Content */}
        {subTab === 'senders' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">{t('settings.resources.senders.title')}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {t('settings.resources.senders.subtitle')}
                </p>
              </div>
              <Link
                to="/dashboard/audience?sender=true"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> {t('settings.resources.senders.add')}
              </Link>
            </div>

            {loading.senders ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-20" />
              </div>
            ) : senders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getPaginatedData(senders, 'senders').map((sender) => (
                  <div
                    key={sender.id}
                    className="p-5 border border-slate-100 rounded-3xl bg-white/50 hover:bg-white hover:shadow-xl hover:shadow-slate-900/2 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                          <Mail className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate tracking-tight">
                            {sender.email}
                          </p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">
                            {t('settings.resources.senders.provider', { type: sender.type })}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteSender(sender.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-4xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('settings.resources.senders.none')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Templates Content */}
        {subTab === 'templates' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {t('settings.resources.templates.title')}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {t('settings.resources.templates.subtitle')}
                </p>
              </div>
              <Link
                to="/dashboard/templates/create"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> {t('settings.resources.templates.add')}
              </Link>
            </div>

            {loading.templates ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-20" />
              </div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getPaginatedData(templates, 'templates').map((template) => (
                  <div
                    key={template.id}
                    className="p-5 border border-slate-100 rounded-3xl bg-white/50 hover:bg-white hover:shadow-xl hover:shadow-slate-900/2 transition-all duration-300 group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="text-sm font-black text-slate-900 truncate tracking-tight uppercase">
                        {template.name}
                      </h5>
                      <button
                        onClick={() => onDeleteTemplate(template.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-[11px] font-bold text-slate-500 line-clamp-1 mb-6 opacity-60">
                      {template.subject}
                    </p>
                    <Link
                      to="/dashboard/templates"
                      className="text-[9px] text-blue-600 font-black uppercase tracking-[0.25em] flex items-center hover:text-black transition-colors"
                    >
                      {t('settings.resources.templates.manage')} <ChevronRight className="w-3 h-3 ltr:ml-2 ltr:mr-2 rtl:ml-2" />
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-4xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('settings.resources.templates.none')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lists Content */}
        {subTab === 'lists' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">{t('settings.resources.lists.title')}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {t('settings.resources.lists.subtitle')}
                </p>
              </div>
              <Link
                to="/dashboard/audience"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-blue-500/20 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" /> {t('settings.resources.lists.add')}
              </Link>
            </div>

            {loading.batches ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-20" />
              </div>
            ) : batches.length > 0 ? (
              <div className="space-y-3">
                {getPaginatedData(batches, 'lists').map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 bg-white/50 hover:border-blue-200 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-sm font-black text-slate-700 tracking-tight">
                        {batch.originalFilename}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getStatusColor(batch.status)}`}
                    >
                      {t(`settings.resources.status.${batch.status}`)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-4xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('settings.resources.lists.none')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Campaigns Content */}
        {subTab === 'campaigns' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {t('settings.resources.campaigns.title')}
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {t('settings.resources.campaigns.subtitle')}
                </p>
              </div>
              <Link
                to="/dashboard/campaigns"
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" /> {t('settings.resources.campaigns.view')}
              </Link>
            </div>

            {loading.campaigns ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-20" />
              </div>
            ) : campaigns.length > 0 ? (
              <div className="space-y-3">
                {getPaginatedData(campaigns, 'campaigns').map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-5 rounded-3xl border border-slate-100 bg-white/50 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                        <Globe className="w-4.5 h-4.5" />
                      </div>
                      <span className="text-sm font-black text-slate-700 tracking-tight uppercase">
                        {campaign.name}
                      </span>
                    </div>
                    <span
                      className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border ${getStatusColor(campaign.status)}`}
                    >
                      {t(`settings.resources.status.${campaign.status}`)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50/50 rounded-4xl border border-dashed border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {t('settings.resources.campaigns.none')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dynamic Pagination Component */}
      <div className="mt-auto px-10 pb-10">
        {subTab === 'senders' && senders.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={pages.senders}
            totalItems={senders.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(p) => handlePageChange('senders', p)}
          />
        )}
        {subTab === 'templates' && templates.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={pages.templates}
            totalItems={templates.length}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(p) => handlePageChange('templates', p)}
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
    </motion.div>
  );
};

export default ResourcesTab;
