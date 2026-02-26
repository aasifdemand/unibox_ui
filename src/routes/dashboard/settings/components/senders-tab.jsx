import { Mail, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const SendersTab = ({ senders, loading, onDelete, isDeleting }) => {
  const { t } = useTranslation();
  const getStatusColor = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSenderIcon = (type) => {
    switch (type) {
      case 'gmail':
        return '🔴 Gmail';
      case 'outlook':
        return '🔵 Outlook';
      case 'smtp':
        return '🟢 SMTP';
      default:
        return '⚙️ Custom';
    }
  };

  return (
    <div>
      <div className="p-6 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{t('settings.resources.senders.title')}</h3>
            <p className="text-sm text-gray-600 mt-1">{t('settings.resources.senders.manage_desc')}</p>
          </div>
          <Link
            to="/dashboard/audience?sender=true"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center text-sm"
          >
            <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {t('settings.resources.senders.add')}
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : senders.length > 0 ? (
        <div className="divide-y divide-gray-200">
          {senders.map((sender) => (
            <div key={sender.id} className="p-6 hover:bg-gray-50/50 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${sender.type === 'gmail'
                        ? 'bg-red-100'
                        : sender.type === 'outlook'
                          ? 'bg-blue-100'
                          : 'bg-green-100'
                      }`}
                  >
                    <Mail
                      className={`w-5 h-5 ${sender.type === 'gmail'
                          ? 'text-red-600'
                          : sender.type === 'outlook'
                            ? 'text-blue-600'
                            : 'text-green-600'
                        }`}
                    />
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{sender.email}</h4>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${getStatusColor(sender.isVerified ? 'verified' : 'pending')}`}
                      >
                        {sender.isVerified ? t('common.status.verified') : t('common.status.pending')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {getSenderIcon(sender.type)} •{' '}
                      {sender.type === 'smtp' ? `${sender.smtpHost}:${sender.smtpPort}` : 'OAuth2'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(sender.id)}
                    disabled={isDeleting}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('settings.resources.senders.none')}</h3>
          <Link
            to="/dashboard/audience?sender=true"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center"
          >
            <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
            {t('settings.resources.senders.add')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default SendersTab;
