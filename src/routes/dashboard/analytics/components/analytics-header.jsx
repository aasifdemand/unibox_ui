import { ChevronRight, Clock, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

const AnalyticsHeader = ({isRefreshing,timeRange,setTimeRange,handleRefresh}) => {
    const {t} = useTranslation()
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center">
            {t('analytics.campaign_title')} <span className="ml-2">{t('analytics.analytics_title')}</span>
            {isRefreshing && (
              <Loader2 className="w-4 h-4 ml-3 animate-spin text-slate-400" />
            )}
          </h1>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {t('analytics.analytics_description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0">
          <div className="relative group w-full sm:w-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none w-full sm:w-auto ltr:pl-10 ltr:pr-10   rtl:pl-10 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 shadow-sm focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition-all outline-none"
            >
              <option value="7">{t('analytics.last_7_days')}</option>
              <option value="30">{t('analytics.last_30_days')}</option>
              <option value="90">{t('analytics.last_90_days')}</option>
            </select>
            <Clock className="absolute ltr:left-3.5 ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <ChevronRight className="absolute ltr:right-3.5 rtl:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90" />
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-primary flex items-center justify-center px-6 w-full sm:w-auto py-2.5"
          >
            {!isRefreshing && <RefreshCw className="w-4 h-4 ltr:mr-2 rtl:ml-2" />}
            {isRefreshing ? t('analytics.refreshing') : t('analytics.refresh_data')}
          </button>
        </div>
      </div>
  )
}

export default AnalyticsHeader