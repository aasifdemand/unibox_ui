import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { CheckCircle2, RefreshCw, Layout, Shield } from 'lucide-react';
import Modal from '../components/shared/modal';

const ConnectIntegration = ({
  isOpen,
  onClose,
  integration,
  apiKey,
  setApiKey,
  isConnecting,
  isVerifyingOAuth,
  handleApiKeySubmit,
  handleOAuthVerify,
}) => {
  const { t } = useTranslation();

  if (!integration) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" closeOnBackdrop={true}>
      {/* Premium Header */}
      <div className="bg-linear-to-br from-orange-600 to-red-700 p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Layout className="w-20 h-20 text-white" />
        </div>
        <div className="relative flex items-center gap-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm p-2"
          >
            <img 
              src={integration.logo} 
              alt={integration.name} 
              className="w-full h-full object-contain brightness-0 invert" 
            />
          </motion.div>
          <div>
            <h3 className="text-xl font-black text-white tracking-tight uppercase">
              {t('integrations.connect_btn')} {integration.name}
            </h3>
            <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest mt-1 flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> {t('integrations.secure', 'Secure')}{' '}
              {integration.authType?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
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
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm font-bold text-slate-800 mb-2">
                  {t('integrations.complete_auth', 'Complete {{name}} Authorization', { name: integration.name })}
                </p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {t('integrations.verify_oauth_desc', { name: integration.name })}
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
                    name: integration.name,
                  })}
                  className="w-full h-14 px-5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
                  autoFocus
                />
              </div>
            )}

            {!isVerifyingOAuth && (
              <div className="p-4 bg-orange-50/50 rounded-lg border border-orange-100/50">
                <p className="text-xs text-orange-600/80 font-medium leading-relaxed">
                  {t('integrations.api_key_desc', { name: integration.name })}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isConnecting || (!isVerifyingOAuth && !apiKey.trim())}
            className="w-full h-14 bg-orange-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
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
    </Modal>
  );
};

export default ConnectIntegration;
