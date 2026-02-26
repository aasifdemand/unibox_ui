import {
  AtSign,
  CheckCircle,
  Mail,
  Server,
  RefreshCw,
  AlertCircle,
  Shield,
  Zap,
  Eye,
  EyeOff,
  Loader2,
  FileSpreadsheet,
  Upload,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useState, useRef } from 'react';
import Modal from '../components/shared/modal';
import { Microsoft } from '../icons/microsoft';
import { Google } from '../icons/google';
import { Smtp } from '../icons/smtp';
import Button from '../components/ui/button';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';

// Import React Query hooks
import { useTestSmtp, useTestImap, useBulkUploadSenders } from '../hooks/useSenders';

const ShowSender = ({
  setShowSenderModal,
  setSenderType,
  senderType,
  handleGmailOAuth,
  handleOutlookOAuth,
  handleSmtpSubmit,
  smtpData,
  setSmtpData,
  isSubmitting = false,
}) => {
  const { t } = useTranslation();
  const [settingsTab, setSettingsTab] = useState('smtp');
  const [smtpTestResult, setSmtpTestResult] = useState(null);
  const [imapTestResult, setImapTestResult] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showImapPassword, setShowImapPassword] = useState(false);

  // React Query hooks
  const testSmtp = useTestSmtp();
  const testImap = useTestImap();
  const bulkUpload = useBulkUploadSenders();

  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [fileRows, setFileRows] = useState([]);
  const [mapping, setMapping] = useState({
    email: '',
    domain: '',
    password: '',
    type: '',
    first_name: '',
    last_name: '',
  });
  const [isMapping, setIsMapping] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Get all data
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonData.length === 0) {
          toast.error(t('modals.sender.err_empty'));
          return;
        }

        const headers = jsonData[0] || [];
        const rows = jsonData.slice(1);

        if (headers.length === 0) {
          toast.error(t('modals.sender.err_no_headers'));
          return;
        }

        const cleanHeaders = headers.map((h) => h?.toString()?.toLowerCase()?.trim());

        setFileHeaders(headers);
        setFileRows(rows);
        setSelectedFile(file);

        // Auto-mapping logic
        const newMapping = {
          email: '',
          domain: '',
          password: '',
          type: '',
          first_name: '',
          last_name: '',
        };

        cleanHeaders.forEach((h, index) => {
          if (['email', 'email_address', 'user_email', 'mail'].includes(h))
            newMapping.email = index.toString();
          if (['domain', 'site_domain', 'host'].includes(h)) newMapping.domain = index.toString();
          if (['password', 'pass', 'smtp_password', 'pw'].includes(h))
            newMapping.password = index.toString();
          if (['type', 'sender_type', 'account_type', 'provider'].includes(h))
            newMapping.type = index.toString();
          if (['first_name', 'fname', 'firstname', 'first'].includes(h))
            newMapping.first_name = index.toString();
          if (['last_name', 'lname', 'lastname', 'last'].includes(h))
            newMapping.last_name = index.toString();
        });

        setMapping(newMapping);
        setIsMapping(true);
      } catch (err) {
        console.error('File validation error:', err);
        toast.error(t('modals.sender.err_read_fail'));
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onBulkUploadSubmit = async () => {
    if (!mapping.email || !mapping.domain || !mapping.password || !mapping.type) {
      toast.error(t('modals.sender.err_map_required'));
      return;
    }

    try {
      // Transform data based on mapping
      const mappedData = fileRows.map((row) => ({
        email: row[parseInt(mapping.email)]?.toString() || '',
        domain: row[parseInt(mapping.domain)]?.toString() || '',
        password: row[parseInt(mapping.password)]?.toString() || '',
        type: row[parseInt(mapping.type)]?.toString() || '',
        first_name: mapping.first_name ? row[parseInt(mapping.first_name)]?.toString() || '' : '',
        last_name: mapping.last_name ? row[parseInt(mapping.last_name)]?.toString() || '' : '',
      }));

      // Create a new Excel file to send to the backend
      const worksheet = XLSX.utils.json_to_sheet(mappedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Senders');

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const finalFile = new File([blob], 'bulk_senders.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const response = await bulkUpload.mutateAsync(finalFile);
      setUploadResult(response.data);
      toast.success(response.message || t('modals.sender.bulk_success'));
      setIsMapping(false);
      setSelectedFile(null);
    } catch (err) {
      toast.error(err.message || t('modals.sender.bulk_error'));
    }
  };

  // Test SMTP connection only
  const testSmtpConnection = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setSmtpTestResult(null);

    try {
      const result = await testSmtp.mutateAsync({
        host: smtpData.host,
        port: smtpData.port,
        secure: smtpData.secure,
        username: smtpData.username,
        password: smtpData.password,
      });

      setSmtpTestResult({
        success: true,
        message: result.message || t('modals.sender.smtp_success'),
      });
    } catch (err) {
      setSmtpTestResult({
        success: false,
        message: err.message || t('modals.sender.smtp_fail'),
      });
    }
  };

  // Test IMAP connection only
  const testImapConnection = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setImapTestResult(null);

    // Auto-fill IMAP host if not provided
    const imapHost = smtpData.imapHost || smtpData.host?.replace('smtp', 'imap');

    try {
      const result = await testImap.mutateAsync({
        host: imapHost,
        port: smtpData.imapPort || 993,
        secure: smtpData.imapSecure !== undefined ? smtpData.imapSecure : true,
        user: smtpData.imapUser || smtpData.username,
        password: smtpData.imapPassword || smtpData.password,
      });

      setImapTestResult({
        success: true,
        message: result.message || t('modals.sender.imap_success'),
      });
    } catch (err) {
      setImapTestResult({
        success: false,
        message: err.message || t('modals.sender.imap_fail'),
      });
    }
  };

  const clearTestResults = () => {
    setSmtpTestResult(null);
    setImapTestResult(null);
  };

  const isSmtpTesting = testSmtp.isPending;
  const isImapTesting = testImap.isPending;

  return (
    <Modal
      isOpen={true}
      onClose={() => {
        setShowSenderModal(false);
        clearTestResults();
      }}
      maxWidth="max-w-3xl"
      closeOnBackdrop={true}
    >
      <div className="bg-linear-to-br from-indigo-600 to-blue-700 p-8 relative overflow-hidden group">
        <div className="absolute top-0 ltr:right-0 rtl:left-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <Mail className="w-20 h-20 text-blue-400" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
            <Mail className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white uppercase tracking-tighter">
              {t('modals.sender.title.new')}
            </h3>
            <p className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest mt-0.5">
              {t('modals.sender.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Sender Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              type: 'gmail',
              label: t('modals.sender.types.gmail'),
              icon: Google,
              color: 'rose',
              bg: 'bg-rose-50',
              text: 'text-rose-600',
              desc: 'OAuth 2.0',
            },
            {
              type: 'outlook',
              label: t('modals.sender.types.outlook'),
              icon: Microsoft,
              color: 'blue',
              bg: 'bg-blue-50',
              text: 'text-blue-600',
              desc: 'Microsoft Graph',
            },
            {
              type: 'smtp',
              label: t('modals.sender.types.smtp'),
              icon: Smtp,
              color: 'slate',
              bg: 'bg-slate-100',
              text: 'text-slate-600',
              desc: t('modals.sender.types.smtp_desc'),
            },
            {
              type: 'bulk',
              label: t('modals.sender.types.bulk'),
              icon: FileSpreadsheet,
              color: 'indigo',
              bg: 'bg-indigo-50',
              text: 'text-indigo-600',
              desc: t('modals.sender.types.bulk_desc'),
            },
          ].map((item, index) => (
            <motion.button
              key={item.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => {
                setSenderType(item.type);
                clearTestResults();
              }}
              disabled={isSubmitting}
              className={`group relative p-6 rounded-[2.5rem] border-2 transition-all duration-500 ${senderType === item.type
                ? `border-${item.color}-500 bg-${item.color}-50/30 shadow-2xl shadow-${item.color}-500/10`
                : 'border-slate-50 bg-white hover:border-slate-200'
                } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}
                >
                  <item.icon className={`w-7 h-7 ${item.text}`} />
                </div>
                <span className="text-sm font-extrabold text-slate-800 uppercase tracking-tight">
                  {item.label}
                </span>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {item.desc}
                </p>
              </div>
              {senderType === item.type && (
                <div className="absolute top-4 ltr:right-4 rtl:left-4 animate-in zoom-in">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40">
                    <CheckCircle className="w-3.5 h-3.5 text-white" />
                  </div>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {senderType === 'gmail' || senderType === 'outlook' ? (
              <motion.div
                key="oauth"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`p-6 rounded-[2.5rem] border-2 ${senderType === 'gmail' ? 'bg-rose-50/20 border-rose-100' : 'bg-blue-50/20 border-blue-100'} relative overflow-hidden`}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-xl border border-white/50">
                      <Shield
                        className={`w-8 h-8 ${senderType === 'gmail' ? 'text-rose-500' : 'text-blue-500'}`}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-extrabold text-slate-800 uppercase tracking-tighter">
                        {t('modals.sender.secure_title')}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {t('modals.sender.secure_desc')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      {
                        icon: Zap,
                        label: t('modals.sender.benefits.no_passwords.title'),
                        desc: t('modals.sender.benefits.no_passwords.desc'),
                      },
                      {
                        icon: CheckCircle,
                        label: t('modals.sender.benefits.deliverability.title'),
                        desc: t('modals.sender.benefits.deliverability.desc'),
                      },
                      {
                        icon: AtSign,
                        label: t('modals.sender.benefits.tracking.title'),
                        desc: t('modals.sender.benefits.tracking.desc'),
                      },
                      {
                        icon: Shield,
                        label: t('modals.sender.benefits.encryption.title'),
                        desc: t('modals.sender.benefits.encryption.desc'),
                      },
                    ].map((benefit, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-4 p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/60"
                      >
                        <benefit.icon
                          className={`w-5 h-5 mt-0.5 ${senderType === 'gmail' ? 'text-rose-400' : 'text-blue-400'}`}
                        />
                        <div>
                          <p className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight">
                            {benefit.label}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight mt-1">
                            {benefit.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={senderType === 'gmail' ? handleGmailOAuth : handleOutlookOAuth}
                      className={`px-12 py-5 rounded-2xl text-[11px] font-extrabold uppercase tracking-widest text-white shadow-2xl transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-4 ${senderType === 'gmail'
                        ? 'bg-rose-600 shadow-rose-600/30'
                        : 'bg-blue-600 shadow-blue-600/30'
                        }`}
                    >
                      {senderType === 'gmail' ? (
                        <Google className="w-5 h-5" />
                      ) : (
                        <Microsoft className="w-5 h-5" />
                      )}
                      {senderType === 'gmail' ? t('modals.sender.btn_connect_gmail') : t('modals.sender.btn_connect_outlook')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : senderType === 'smtp' ? (
              <motion.div
                key="smtp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-tighter">
                        {t('modals.sender.info_title')}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                        {t('modals.sender.info_subtitle')}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                        {t('modals.sender.fields.from_name')}
                      </p>
                      <input
                        type="text"
                        value={smtpData.displayName}
                        onChange={(e) =>
                          setSmtpData({
                            ...smtpData,
                            displayName: e.target.value,
                          })
                        }
                        required
                        disabled={isSubmitting}
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        placeholder="e.g. John Smith"
                      />
                    </div>
                    <div className="group space-y-2">
                      <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                        {t('modals.sender.fields.email')}
                      </p>
                      <input
                        type="email"
                        value={smtpData.email}
                        onChange={(e) => setSmtpData({ ...smtpData, email: e.target.value })}
                        required
                        disabled={isSubmitting}
                        className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        placeholder="sender@example.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-2 rounded-4xl border-2 border-slate-100 flex gap-2">
                  {[
                    { id: 'smtp', label: t('modals.sender.tabs.smtp'), icon: Smtp },
                    {
                      id: 'imap',
                      label: t('modals.sender.tabs.imap'),
                      icon: Mail,
                      tag: t('common.optional'),
                    },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSettingsTab(tab.id)}
                      disabled={isSubmitting}
                      className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all ${settingsTab === tab.id
                        ? 'bg-white text-blue-600 shadow-xl shadow-slate-200/50 border border-slate-100'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      <span className="text-[10px] font-extrabold uppercase tracking-widest">
                        {tab.label}
                      </span>
                      {tab.tag && (
                        <span className="text-[8px] font-bold text-slate-400 lowercase italic">
                          ({tab.tag})
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {settingsTab === 'smtp' ? (
                  <div className="animate-in fade-in duration-500 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                          {t('modals.sender.fields.host')}
                        </label>
                        <div className="relative group/field">
                          <div className="absolute ltr:left-4 ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-blue-500 transition-colors">
                            <Server className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={smtpData.host}
                            onChange={(e) => setSmtpData({ ...smtpData, host: e.target.value })}
                            className="w-full h-14 ltr:pl-12 ltr:pr-12 rtl:pl-12 ltr:pr-6 rtl:pl-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                            placeholder={t('modals.sender.fields.placeholder_host_smtp')}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                          {t('modals.sender.fields.port')}
                        </label>
                        <div className="relative group/field">
                          <div className="absolute ltr:left-4 ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-blue-500 transition-colors">
                            <Zap className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={smtpData.port}
                            onChange={(e) => setSmtpData({ ...smtpData, port: e.target.value })}
                            className="w-full h-14 ltr:pl-12 ltr:pr-12 rtl:pl-12 ltr:pr-4 rtl:pl-4 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                            placeholder={t('modals.sender.fields.placeholder_port_smtp')}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                          {t('modals.sender.fields.username')}
                        </p>
                        <input
                          type="text"
                          value={smtpData.username}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              username: e.target.value,
                            })
                          }
                          required
                          className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                          placeholder={t('modals.sender.fields.placeholder_email')}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                          {t('modals.sender.fields.password')}
                        </p>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={smtpData.password}
                            onChange={(e) =>
                              setSmtpData({
                                ...smtpData,
                                password: e.target.value,
                              })
                            }
                            required
                            className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none ltr:pr-14 rtl:pl-14"
                            placeholder={t('modals.sender.fields.placeholder_pass')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute ltr:right-5 rtl:left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={smtpData.secure}
                            onChange={(e) =>
                              setSmtpData({
                                ...smtpData,
                                secure: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-12 h-7 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-all duration-300 after:content-[''] after:absolute after:top-1 after:ltr:left-1 ltr:right-1 rtl:left-1 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5 shadow-sm"></div>
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">
                          {t('modals.sender.fields.secure')}
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={testSmtpConnection}
                        disabled={isSmtpTesting || !smtpData.host || !smtpData.password}
                        className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isSmtpTesting ? 'animate-spin' : ''}`} />
                        {isSmtpTesting ? t('modals.sender.btn.connecting') : t('modals.sender.btn.test')}
                      </button>
                    </div>

                    {smtpTestResult && (
                      <div
                        className={`p-6 rounded-4xl border-2 animate-in slide-in-from-top-4 duration-500 ${smtpTestResult.success
                          ? 'bg-emerald-50/50 border-emerald-100'
                          : 'bg-rose-50/50 border-rose-100'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${smtpTestResult.success ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          >
                            {smtpTestResult.success ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-[10px] font-extrabold uppercase tracking-widest ${smtpTestResult.success ? 'text-emerald-600' : 'text-rose-600'}`}
                            >
                              {smtpTestResult.success ? t('common.success') : t('common.failed')}
                            </p>
                            <p
                              className={`text-xs font-bold mt-1 ${smtpTestResult.success ? 'text-emerald-700' : 'text-rose-700'}`}
                            >
                              {smtpTestResult.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-500 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                          {t('modals.sender.fields.host')}
                        </p>
                        <input
                          type="text"
                          value={smtpData.imapHost || ''}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              imapHost: e.target.value,
                            })
                          }
                          className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                          placeholder={t('modals.sender.fields.placeholder_host_imap')}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                          {t('modals.sender.fields.port')}
                        </p>
                        <input
                          type="number"
                          value={smtpData.imapPort || ''}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              imapPort: e.target.value,
                            })
                          }
                          className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                          placeholder={t('modals.sender.fields.placeholder_port_imap')}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                          {t('modals.sender.fields.username')}
                        </p>
                        <input
                          type="text"
                          value={smtpData.imapUser || ''}
                          onChange={(e) =>
                            setSmtpData({
                              ...smtpData,
                              imapUser: e.target.value,
                            })
                          }
                          className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                          placeholder={t('modals.sender.fields.placeholder_email')}
                        />
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1">
                          {t('modals.sender.fields.password')}
                        </p>
                        <div className="relative">
                          <input
                            type={showImapPassword ? 'text' : 'password'}
                            value={smtpData.imapPassword || ''}
                            onChange={(e) =>
                              setSmtpData({
                                ...smtpData,
                                imapPassword: e.target.value,
                              })
                            }
                            className="w-full h-14 ltr:pl-6 ltr:pr-6 rtl:pl-6 ltr:pr-12 rtl:pl-12 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-blue-500 transition-all outline-none"
                            placeholder={t('modals.sender.fields.placeholder_pass')}
                          />
                          <button
                            type="button"
                            onClick={() => setShowImapPassword(!showImapPassword)}
                            className="absolute ltr:right-5 rtl:left-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showImapPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-2">
                      <label className="flex items-center gap-4 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={smtpData.imapSecure || false}
                            onChange={(e) =>
                              setSmtpData({
                                ...smtpData,
                                imapSecure: e.target.checked,
                              })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-12 h-7 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-all duration-300 after:content-[''] after:absolute after:top-1 after:ltr:left-1 ltr:right-1 rtl:left-1 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5 shadow-sm"></div>
                        </div>
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest group-hover:text-slate-800 transition-colors">
                          {t('modals.sender.fields.secure')}
                        </span>
                      </label>

                      <button
                        type="button"
                        onClick={testImapConnection}
                        className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${isImapTesting ? 'animate-spin' : ''}`} />
                        {isImapTesting ? t('modals.sender.btn.connecting') : t('modals.sender.btn.test')}
                      </button>
                    </div>

                    {imapTestResult && (
                      <div
                        className={`p-6 rounded-4xl border-2 animate-in slide-in-from-top-4 duration-500 ${imapTestResult.success
                          ? 'bg-emerald-50/50 border-emerald-100'
                          : 'bg-rose-50/50 border-rose-100'
                          }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${imapTestResult.success ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          >
                            {imapTestResult.success ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-[10px] font-extrabold uppercase tracking-widest ${imapTestResult.success ? 'text-emerald-600' : 'text-rose-600'}`}
                            >
                              {imapTestResult.success ? t('common.success') : t('common.failed')}
                            </p>
                            <p
                              className={`text-xs font-bold mt-1 ${imapTestResult.success ? 'text-emerald-700' : 'text-rose-700'}`}
                            >
                              {imapTestResult.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                      <div className="flex gap-4">
                        <Zap className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-bold text-blue-700 leading-relaxed uppercase tracking-tight">
                          If you leave these empty, we&apos;ll try to use your sending settings
                          automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : senderType === 'bulk' ? (
              <motion.div
                key="bulk"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center space-y-3 mb-8">
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
                    {t('modals.sender.bulk.title')}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {t('modals.sender.bulk.desc')}
                  </p>
                </div>

                {isMapping ? (
                  <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="flex items-center justify-between px-2">
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-tighter">
                          {t('modals.sender.bulk.mapping_title')}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          {t('modals.sender.bulk.mapping_subtitle')}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setIsMapping(false);
                          setSelectedFile(null);
                          setFileHeaders([]);
                          setFileRows([]);
                        }}
                        className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest px-4 py-2 bg-indigo-50 rounded-xl transition-all"
                      >
                        {t('modals.sender.bulk.change_file')}
                      </button>
                    </div>

                    {/* Table Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-1">
                        <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                          {t('modals.sender.bulk.preview_title', { count: fileRows.length })}
                        </p>
                      </div>
                      <div className="rounded-4xl border-2 border-slate-100 bg-white shadow-sm overflow-hidden">
                        <div className="max-h-60 overflow-y-auto no-scrollbar overflow-x-auto">
                          <table className="w-full ltr:text-left ltr:text-right rtl:text-left border-collapse min-w-full">
                            <thead className="sticky top-0 z-10">
                              <tr className="bg-slate-50">
                                {fileHeaders.map((header, i) => (
                                  <th
                                    key={i}
                                    className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 whitespace-nowrap bg-slate-50"
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {fileRows.slice(0, 10).map((row, rowIndex) => (
                                <tr
                                  key={rowIndex}
                                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                                >
                                  {fileHeaders.map((_, colIndex) => (
                                    <td
                                      key={colIndex}
                                      className="px-6 py-4 text-[11px] font-bold text-slate-600 whitespace-nowrap max-w-50 truncate"
                                    >
                                      {row[colIndex]?.toString() || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                              {fileRows.length > 10 && (
                                <tr className="bg-slate-50/30">
                                  <td
                                    colSpan={fileHeaders.length}
                                    className="px-6 py-3 text-[9px] font-black text-slate-400 text-center uppercase tracking-widest italic"
                                  >
                                    {t('modals.sender.bulk.more_rows', { count: fileRows.length - 10 })}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Mapping Selects */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { key: 'email', label: t('modals.sender.fields.email'), required: true },
                        { key: 'domain', label: t('modals.sender.fields.domain'), required: true },
                        { key: 'password', label: t('modals.sender.fields.password'), required: true },
                        {
                          key: 'type',
                          label: t('modals.sender.fields.type'),
                          required: true,
                          desc: 'aapanel/postal',
                        },
                        { key: 'first_name', label: t('modals.sender.fields.first_name'), required: false },
                        { key: 'last_name', label: t('modals.sender.fields.last_name'), required: false },
                      ].map((field) => (
                        <div key={field.key} className="space-y-2 group">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest px-1 flex items-center justify-between">
                            <span>
                              {field.label}{' '}
                              {field.required && <span className="text-rose-500">*</span>}
                            </span>
                            {field.desc && (
                              <span className="text-[8px] font-bold text-slate-300 italic">
                                {field.desc}
                              </span>
                            )}
                          </label>
                          <div className="relative">
                            <select
                              value={mapping[field.key]}
                              onChange={(e) =>
                                setMapping({ ...mapping, [field.key]: e.target.value })
                              }
                              className="w-full h-14 ltr:pl-6 ltr:pr-6 rtl:pl-6 ltr:pr-12 rtl:pl-12 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold text-slate-700 focus:border-indigo-500 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                            >
                              <option value="">{t('modals.sender.bulk.select_col')}</option>
                              {fileHeaders.map((header, i) => (
                                <option key={i} value={i.toString()}>
                                  {header}
                                </option>
                              ))}
                            </select>
                            <div className="absolute ltr:right-5 rtl:left-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                              <RefreshCw className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex gap-4">
                      <Shield className="w-5 h-5 text-indigo-500 shrink-0" />
                      <p className="text-[10px] font-bold text-indigo-700 leading-relaxed uppercase tracking-tight">
                        {t('modals.sender.bulk.transform_note')}
                      </p>
                    </div>
                  </div>
                ) : uploadResult ? (
                  <div className="bg-emerald-50/50 p-8 rounded-[2.5rem] border-2 border-emerald-100 animate-in zoom-in duration-500">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <CheckCircle className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h5 className="text-lg font-extrabold text-emerald-800 uppercase tracking-tighter">
                          {t('modals.sender.bulk.upload_complete')}
                        </h5>
                        <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mt-1">
                          {t('modals.sender.bulk.upload_summary', { count: uploadResult.successCount })}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full mt-4">
                        <div className="p-4 bg-white/60 rounded-2xl border border-emerald-100">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                            {t('common.success')}
                          </p>
                          <p className="text-2xl font-black text-emerald-600">
                            {uploadResult.successCount}
                          </p>
                        </div>
                        <div className="p-4 bg-white/60 rounded-2xl border border-emerald-100">
                          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
                            {t('common.failed')}
                          </p>
                          <p className="text-2xl font-black text-rose-600">
                            {uploadResult.failedCount}
                          </p>
                        </div>
                      </div>

                      {uploadResult.errors?.length > 0 && (
                        <div className="w-full ltr:text-left ltr:text-right rtl:text-left mt-4 max-h-40 overflow-y-auto p-4 bg-rose-50/50 rounded-2xl border border-rose-100 no-scrollbar">
                          <p className="text-[10px] font-extrabold text-rose-600 uppercase tracking-widest mb-2">
                            {t('modals.sender.bulk.errors')}
                          </p>
                          <ul className="space-y-1">
                            {uploadResult.errors.map((err, i) => (
                              <li
                                key={i}
                                className="text-[10px] font-bold text-rose-700 list-disc ltr:ml-4 ltr:mr-4 rtl:ml-4 leading-tight"
                              >
                                {err}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={() => setUploadResult(null)}
                        className="mt-4 text-[10px] font-extrabold text-blue-600 uppercase tracking-widest hover:underline"
                      >
                        {t('modals.sender.bulk.upload_another')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 hover:border-indigo-400/50 hover:bg-indigo-50/10 cursor-pointer transition-all duration-500"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    <div className="flex flex-col items-center gap-6">
                      <div className="w-20 h-20 bg-slate-50 rounded-4xl flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50 transition-all duration-500">
                        {selectedFile ? (
                          <FileSpreadsheet className="w-8 h-8 text-indigo-500" />
                        ) : (
                          <Upload className="w-8 h-8 text-slate-300 group-hover:text-indigo-500" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-extrabold text-slate-800 uppercase tracking-widest mb-1">
                          {selectedFile ? selectedFile.name : t('modals.sender.bulk.click_upload')}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                          {selectedFile
                            ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                            : t('modals.sender.bulk.drag_drop')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100 group"
              >
                <div className="w-20 h-20 bg-white rounded-4xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-slate-50">
                  <Mail className="w-10 h-10 text-slate-200" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-2">
                  {t('modals.sender.empty_provider')}
                </h4>
                <p className="text-xs text-slate-400 font-medium italic">
                  {t('modals.sender.empty_desc')}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-emerald-500" />
            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
              {t('modals.sender.encrypted_note')}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShowSenderModal(false)}
              className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95"
            >
              {t('common.cancel')}
            </button>
            {senderType === 'smtp' && (
              <Button
                type="button"
                onClick={handleSmtpSubmit}
                disabled={isSubmitting || !smtpData.host || !smtpData.password}
                variant="primary"
                className="px-10 py-4 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Zap className="w-4 h-4" />
                )}
                {t('modals.sender.btn.add')}
              </Button>
            )}
            {senderType === 'bulk' && !uploadResult && (
              <Button
                type="button"
                onClick={isMapping ? onBulkUploadSubmit : () => fileInputRef.current?.click()}
                disabled={bulkUpload.isPending}
                variant="primary"
                className="px-10 py-4 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest bg-indigo-600 shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 text-white"
              >
                {bulkUpload.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>{t('modals.sender.bulk.uploading')}</span>
                  </>
                ) : (
                  <>
                    {isMapping ? <Zap className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                    {isMapping ? t('modals.sender.bulk.complete_btn') : t('modals.sender.bulk.select_btn')}
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShowSender;
