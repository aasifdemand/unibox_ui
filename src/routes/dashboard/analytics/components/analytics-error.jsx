import { Inbox, RefreshCw } from 'lucide-react'
import React from 'react'
import { useTranslation } from 'react-i18next'

const AnalyticsError = ({handleRefresh,error}) => {
    const {t} = useTranslation()
  return (
    <div className="p-8">
        <div className="premium-card p-12 text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 mx-auto rounded-lg bg-red-50 flex items-center justify-center mb-6 border border-red-100 shadow-inner">
            <Inbox className="w-10 h-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
            {t('analytics.failed_to_load')}
          </h3>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            {error.overview.message}
          </p>
          <button onClick={handleRefresh} className="btn-primary flex items-center mx-auto">
            <RefreshCw className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {t('analytics.try_again')}
          </button>
        </div>
      </div>
  )
}

export default AnalyticsError