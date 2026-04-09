import { useTranslation } from 'react-i18next';
import { Clock, Database, ExternalLink, Send, Settings2, ShieldCheck, Target, Activity } from 'lucide-react';

const OverviewTab = ({ campaign, stats, previews, placeholders, formatDate, steps }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
      {/* Left Column: Progress & Details */}
      <div className="lg:col-span-2 space-y-8">
        {/* Campaign Progress */}
        <div className="premium-card bg-white border-slate-200/60 p-8 shadow-sm shadow-slate-900/2">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                {t('campaigns.overview.progress', 'Campaign Progress')}
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                {t('campaigns.overview.live_progress', 'Live Sending Progress')}
              </p>
            </div>
            <div className="ltr:text-right rtl:text-left">
              <span className="text-3xl font-bold text-purple-600 tabular-nums">
                {stats.progress}%
              </span>
              <p className="text-xs font-bold text-purple-400 leading-none">
                {t('campaigns.overview.complete', 'Complete')}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40 p-0.5">
              <div
                className="h-full bg-linear-to-r from-purple-500 via-purple-600 to-purple-700 rounded-full transition-all duration-1000 ease-out shadow-sm shadow-purple-500/20"
                style={{ width: `${stats.progress}%` }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-size-[40px_40px] animate-[shimmer_2s_infinite_linear]"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-4 px-2">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500 mb-1.5">
                  {t('campaigns.overview.remaining', 'Remaining')}
                </span>
                <span className="text-2xl font-bold text-slate-900 tracking-tight tabular-nums">
                  {Math.max(0, stats.totalRecipients - stats.totalSent).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col ltr:text-right rtl:text-left">
                <span className="text-xs font-semibold text-slate-500 mb-1.5">
                  {t('campaigns.overview.total_sent', 'Total Sent')}
                </span>
                <span className="text-2xl font-bold text-purple-600 tracking-tight tabular-nums">
                  {stats.totalSent.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Campaign Sequence Logic */}
        {steps && steps.length > 1 && (
          <div className="premium-card bg-white border-slate-200/60 p-8 shadow-sm shadow-slate-900/2">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-8">
              <Activity className="w-5 h-5 text-purple-600" />
              {t('campaigns.overview.sequence', 'Campaign Sequence')}
            </h3>

            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute ltr:left-5 rtl:right-5 top-2 bottom-2 w-0.5 bg-slate-100"></div>

              <div className="space-y-10 relative">
                {steps.map((step, idx) => (
                  <div key={step.id} className="flex gap-6">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm relative z-10 ${
                        idx === 0
                          ? 'bg-purple-600 text-white shadow-purple-200'
                          : 'bg-white border border-slate-200 text-slate-400'
                      }`}
                    >
                      {idx === 0 ? <Send className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-slate-900 tracking-tight">
                          {t('campaigns.overview.step', 'Step')} {idx + 1}: {idx === 0 ? t('campaigns.overview.initial_email', 'Initial Email') : t('campaigns.overview.follow_up_email', 'Follow-up Email')}
                        </p>
                        {idx > 0 && (
                          <div className="px-3 py-1 bg-amber-50 rounded-lg border border-amber-100">
                            <span className="text-xs font-bold text-amber-600">
                               {t('campaigns.overview.wait', 'Wait')} {Math.round(step.delayMinutes / 1440)} {t('campaigns.overview.days', 'Days')}
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-400 truncate max-w-md">
                        {t('campaigns.overview.subject_label', 'Subject')}: {step.subject}
                      </p>
                      {idx > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                           <span className="text-[10px] font-bold text-slate-400">
                            {t('campaigns.overview.condition_label', 'Condition')}:
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-bold text-slate-600">
                            {step.condition === 'no_reply' ? t('campaigns.overview.if_no_reply', 'If No Reply') : t('campaigns.overview.always_send', 'Always Send')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaign Details */}
        <div className="premium-card bg-white border-slate-200/60 p-8 shadow-sm shadow-slate-900/2">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-8">
            <Database className="w-5 h-5 text-purple-600" />
            {t('campaigns.overview.details', 'Campaign Details')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <DetailItem label={t('campaigns.overview.name', 'Campaign Name')} value={previews.campaignName} />
              <DetailItem
                label={t('campaigns.overview.subject', 'Subject Line')}
                value={previews.subject}
                subValue={
                  placeholders.length > 0 ? `${t('campaigns.overview.vars_used', 'Variables used')}: ${placeholders.join(', ')}` : null
                }
              />
              <DetailItem label={t('campaigns.overview.preview_text', 'Preview Text')} value={previews.previewText || t('campaigns.overview.not_set', 'Not set')} />
              <DetailItem label={t('campaigns.overview.sender_type', 'Sender Type')} value={campaign.senderType === 'standard' ? t('campaigns.overview.sender_standard', 'Standard') : (campaign.senderType || t('campaigns.overview.sender_standard', 'Standard'))} uppercase />
            </div>
            <div className="space-y-6">
              <DetailItem label={t('campaigns.overview.created_date', 'Created Date')} value={formatDate(campaign.createdAt)} />
              {campaign.startedAt ? (
                <DetailItem label={t('campaigns.overview.started_at', 'Started At')} value={formatDate(campaign.startedAt)} />
              ) : (
                <DetailItem
                  label={t('campaigns.overview.scheduled_for', 'Scheduled For')}
                  value={campaign.scheduledAt ? formatDate(campaign.scheduledAt) : t('campaigns.overview.immediate', 'Immediate')}
                />
              )}
              <DetailItem label={t('campaigns.overview.last_updated', 'Last Updated')} value={formatDate(campaign.updatedAt)} />
              <DetailItem
                label={t('campaigns.overview.sending_rate', 'Sending Rate')}
                value={`${campaign.throttlePerMinute || 10} ${t('campaigns.overview.emails_per_min', 'emails / min')}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Settings */}
      <div className="space-y-8">
        <div className="premium-card bg-white border-slate-200/60 p-8 shadow-sm shadow-slate-900/2 h-full">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-8">
            <Settings2 className="w-5 h-5 text-purple-600" />
            {t('campaigns.overview.settings', 'Campaign Settings')}
          </h3>

          <div className="space-y-6">
            <SettingItem
              icon={<Activity className="w-4 h-4" />}
              label={t('campaigns.overview.track_opens', 'Track Opens')}
              status={campaign.trackOpens}
              desc={t('campaigns.overview.track_opens_desc', 'Monitor when recipients open your emails')}
              t={t}
            />
            <SettingItem
              icon={<Target className="w-4 h-4" />}
              label={t('campaigns.overview.track_clicks', 'Track Clicks')}
              status={campaign.trackClicks}
              desc={t('campaigns.overview.track_clicks_desc', 'Track link interactions within emails')}
              t={t}
            />
            <SettingItem
              icon={<ExternalLink className="w-4 h-4" />}
              label={t('campaigns.overview.unsub_link', 'Unsubscribe Link')}
              status={campaign.unsubscribeLink}
              desc={t('campaigns.overview.unsub_link_desc', 'Include mandatory opt-out option')}
              t={t}
            />

            <div className="pt-8 mt-8 border-t border-slate-100">
              <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-md bg-purple-600 flex items-center justify-center shrink-0 shadow-sm shadow-purple-200">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-900 mb-1">
                    Campaign Status
                  </p>
                  <p className="text-[11px] font-medium text-purple-700 leading-tight">
                    All settings verified. Campaign is optimized and ready.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailItem = ({ label, value, subValue, uppercase }) => (
  <div>
    <p className="text-xs font-semibold text-slate-500 mb-1.5">
      {label}
    </p>
    <p
      className={`text-sm font-bold text-slate-800 tracking-tight ${uppercase ? 'uppercase' : ''}`}
    >
      {value}
    </p>
    {subValue && (
      <p className="text-[10px] font-bold text-purple-400 mt-1">
        {subValue}
      </p>
    )}
  </div>
);

const SettingItem = ({ icon, label, status, desc, t }) => (
  <div className="flex items-start gap-4 group">
    <div
      className={`p-3 rounded-md transition-all duration-300 ${status ? 'bg-purple-50 text-purple-600 scale-110 shadow-sm shadow-purple-100' : 'bg-slate-50 text-slate-400 opacity-50'}`}
    >
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-purple-600 transition-colors">
          {label}
        </p>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${status ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-400'}`}
        >
          {status ? t('campaigns.overview.active', 'Active') : t('campaigns.overview.disabled', 'Disabled')}
        </span>
      </div>
      <p className="text-[10px] font-medium text-slate-500 group-hover:text-slate-600 transition-colors">
        {desc}
      </p>
    </div>
  </div>
);

export default OverviewTab;
