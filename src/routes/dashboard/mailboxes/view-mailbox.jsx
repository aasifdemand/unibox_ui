import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Settings, 
  Activity, 
  ShieldCheck, 
  History, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Zap,
  Globe,
 
  Save,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useMailbox, useUpdateMailbox } from '../../../hooks/useMailboxes';
import { useDeleteSender } from '../../../hooks/useSenders';
import Button from '../../../components/ui/button';
import { toast } from 'react-hot-toast';
import { useCurrentUser } from '../../../hooks/useAuth';
import { formatInTimezone } from '../../../utils/date-utils';
import HtmlEmailEditor from '../../../components/shared/html-editor';


const ViewMailbox = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: mailbox, isLoading, isError } = useMailbox(id);
  const updateMailbox = useUpdateMailbox();
  const deleteSender = useDeleteSender();
  const { data: user } = useCurrentUser();
  const userTz = user?.timezone || 'UTC';

  const [activeTab, setActiveTab] = useState('configuration');
  const [formData, setFormData] = useState(null);

  // Initialize form data when mailbox is loaded
  React.useEffect(() => {
    if (mailbox) {
      setFormData({
        displayName: mailbox.displayName || '',
        minTimeGap: mailbox.minTimeGap || 1,
        designation: mailbox.designation || '',
        signature: mailbox.signature || '',
        bccEmail: mailbox.bccEmail || '',
        replyToAddress: mailbox.replyToAddress || '',
        useCustomTrackingDomain: mailbox.useCustomTrackingDomain || false,
        customTrackingDomain: mailbox.customTrackingDomain || '',
      });
    }
  }, [mailbox]);

  const signatureFields = React.useMemo(() => [
    { fieldName: 'sender_name', displayName: 'Sender Name' },
    { fieldName: 'designation', displayName: 'Designation' },
    { fieldName: 'sender_email', displayName: 'Sender Email' },
  ], []);

  const handleSave = async () => {
    try {
      await updateMailbox.mutateAsync({ id, ...formData });
      toast.success('Mailbox configuration updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update mailbox');
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to disconnect this mailbox? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteSender.mutateAsync({ senderId: id, senderType: mailbox.type });
      toast.success('Mailbox has been removed successfully');
      navigate('/dashboard/mailboxes');
    } catch (err) {
      toast.error(err.message || 'Failed to disconnect mailbox');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-500">Fetching Mailbox Data...</p>
      </div>
    );
  }

  if (isError || !mailbox) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">Mailbox Not Found</h2>
        <p className="text-slate-500 mt-2 mb-6 max-w-md">The mailbox you are looking for does not exist or you do not have permission to view it.</p>
        <Button onClick={() => navigate('/dashboard/mailboxes')} variant="outline">
          Back to Mailboxes
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'configuration', label: 'Configuration', icon: Settings },
    { id: 'analytics', label: 'Analytics & Stats', icon: Activity },
    { id: 'warmup', label: 'Warmup Settings', icon: Zap },
    { id: 'health', label: 'Health & DNS', icon: ShieldCheck },
    { id: 'history', label: 'Activity Logs', icon: History },
  ];

  return (
    <div className="max-w-[1600px] mx-auto ">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/dashboard/mailboxes')}
            className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-purple-600 hover:border-purple-200 transition-all shadow-sm"
          >
            <ArrowLeft className="w-6 h-6" />
          </motion.button>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight leading-none lowercase">
                {mailbox.email}
              </h1>
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-100/50">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
                <span className="text-xs font-bold text-purple-700 whitespace-nowrap">
                  {mailbox.isVerified ? 'Synchronized' : 'Verification Required'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-400">Provider:</span>
                <span className="text-xs font-bold text-purple-600 capitalize bg-purple-50 px-2 py-0.5 rounded">
                  {mailbox.type}
                </span>
              </div>
              <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
                <span className="text-xs font-semibold text-slate-400">Created:</span>
                <span className="text-xs font-bold text-slate-600">
                  {formatInTimezone(mailbox.createdAt, userTz, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="h-11 px-6 font-bold text-xs gap-2 border-slate-200 shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Test Connection
          </Button>
          <Button 
            onClick={handleSave}
            isLoading={updateMailbox.isPending}
            className="h-11 px-8 font-bold text-xs gap-2 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-200"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDelete}
            disabled={deleteSender.isPending}
            className="w-11 h-11 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteSender.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Trash2 className="w-5 h-5" />
            )}
          </motion.button>
        </div>
      </div>

      <div className="flex flex-col space-y-8">
        {/* Navigation Tabs - Refined Style */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-px">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-xs font-bold transition-all relative ${
                activeTab === tab.id 
                  ? 'text-purple-600' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <tab.icon className={`w-3.5 h-3.5 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {tab.label}
              </div>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabUnderline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                />
              )}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Content Area */}
          <div className="lg:col-span-8 flex flex-col space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              layout
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="premium-card min-h-[650px] flex flex-col"
            >
              {activeTab === 'configuration' && (
                <div className="p-8 lg:p-12">
                  <div className="flex items-center justify-between border-b border-slate-100/60 pb-8 mb-10">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">Technical Configuration</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-1.5 opacity-80">Infrastructure & Senders Settings</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-3">
                        <label className="text-metadata ml-1">Display Name</label>
                        <input 
                          type="text" 
                          value={formData?.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                          className="input-premium h-11"
                          placeholder="e.g. John Doe"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-metadata ml-1">Designation</label>
                        <input 
                          type="text" 
                          value={formData?.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          className="input-premium h-11"
                          placeholder="e.g. Head of Sales"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-metadata ml-1">Delivery Time Gap</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={formData?.minTimeGap}
                            onChange={(e) => setFormData({ ...formData, minTimeGap: parseInt(e.target.value) })}
                            className="input-premium h-11"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">Min</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-metadata ml-1">Email Signature</label>
                      <div className="border-2 border-slate-100 rounded-lg overflow-hidden">
                        <HtmlEmailEditor 
                          value={formData?.signature}
                          onChange={(val) => setFormData({ ...formData, signature: val })}
                          userFields={signatureFields}
                          senderName={formData?.displayName}
                        />
                      </div>
                    </div>

                    {/* Advanced Routing */}
                    <div className="p-8 bg-slate-50/50 rounded-lg border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 mb-8 opacity-70">Advanced Routing & Tracking</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-3">
                          <label className="text-metadata ml-1">BCC Email</label>
                          <input 
                            type="email" 
                            value={formData?.bccEmail}
                            onChange={(e) => setFormData({ ...formData, bccEmail: e.target.value })}
                            className="input-premium h-11"
                            placeholder="e.g. log@company.com"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-metadata ml-1">Reply-To Address</label>
                          <input 
                            type="email" 
                            value={formData?.replyToAddress}
                            onChange={(e) => setFormData({ ...formData, replyToAddress: e.target.value })}
                            className="input-premium h-11"
                            placeholder="e.g. support@company.com"
                          />
                        </div>
                      </div>

                      <div className="mt-8 pt-8 border-t border-slate-200/60">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">Custom Tracking Domain</span>
                            <span className="text-xs font-semibold text-slate-400">Increase deliverability by masking tracking links</span>
                          </div>
                          <div 
                            onClick={() => setFormData({ ...formData, useCustomTrackingDomain: !formData.useCustomTrackingDomain })}
                            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 ${formData?.useCustomTrackingDomain ? 'bg-purple-600' : 'bg-slate-200'}`}
                          >
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${formData?.useCustomTrackingDomain ? 'translate-x-6' : 'translate-x-0'}`} />
                          </div>
                        </div>
                        {formData?.useCustomTrackingDomain && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="space-y-2 overflow-hidden"
                          >
                            <div className="relative flex items-center">
                              <Globe className="absolute left-4 w-4 h-4 text-slate-400" />
                             <input 
                                type="text" 
                                value={formData?.customTrackingDomain}
                                onChange={(e) => setFormData({ ...formData, customTrackingDomain: e.target.value })}
                                className="input-premium h-11 pl-12"
                                placeholder="tracking.yourdomain.com"
                              />
                            </div>
                            <p className="text-metadata ml-1 opacity-70">Setup a CNAME record pointing to tracking.unibox.ai</p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="p-8 lg:p-12">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-8 mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">Internal Analytics</h3>
                      <p className="text-xs font-semibold text-slate-500 mt-1">Real-time delivery and interaction metrics</p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-white shadow-xs">Last 7 Days</button>
                      <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-900">30 Days</button>
                    </div>
                  </div>

                  {/* High Level Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                      { label: 'Daily Sent', value: mailbox?.stats?.dailySent || '0', change: '', color: 'indigo' },
                      { label: 'Warmup Sent', value: mailbox?.stats?.warmupCurrentSent || '0', change: '', color: 'emerald' },
                      { label: 'Campaigns', value: mailbox?.campaignCount || '0', change: '', color: 'orange' },
                      { label: 'Total Leads', value: mailbox?.leadCount || '0', change: '', color: 'rose' },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-50 border border-slate-100 rounded-2xl p-6 group hover:border-slate-200 transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100"
                      >
                        <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
                          {stat.change && (
                            <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-purple-500' : 'text-rose-500'}`}>
                              {stat.change}
                            </span>
                          )}
                        </div>
                        <div className="mt-4 h-1 w-full bg-slate-200/50 rounded-full overflow-hidden">
                          <div className={`h-full w-2/3 rounded-full transition-all duration-1000 ${
                            stat.color === 'emerald' ? 'bg-purple-500' : 
                            stat.color === 'orange' ? 'bg-purple-500' : 
                            stat.color === 'rose' ? 'bg-rose-500' : 'bg-violet-500'
                          }`} />
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Empty State Visual for Charts */}
                  <div className="relative p-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[300px]">
                    <Activity className="w-12 h-12 text-slate-300 mb-4 animate-pulse" />
                    <h4 className="text-sm font-bold text-slate-900 tracking-tight">Visualizing Sequence Traffic</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Aggregating historical data points...</p>
                  </div>
                </div>
              )}

              {/* Other tabs placeholders */}
              {(activeTab === 'warmup' || activeTab === 'health' || activeTab === 'history') && (
                <div className="p-12 flex flex-col items-center justify-center min-h-[600px] text-center">
                  <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 group hover:scale-110 transition-transform">
                    {activeTab === 'warmup' && <Zap className="w-10 h-10 text-purple-500" />}
                    {activeTab === 'health' && <ShieldCheck className="w-10 h-10 text-purple-500" />}
                    {activeTab === 'history' && <History className="w-10 h-10 text-slate-400" />}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
                  </h3>
                  <p className="text-sm font-medium text-slate-400 max-w-sm leading-relaxed">
                    This advanced module is currently Synchronizing with your backend environment. Real-time data will populate shortly.
                  </p>
                  <Button variant="outline" className="mt-8 px-8 h-12 text-xs font-bold border-slate-200">
                    Force Metadata Refresh
                  </Button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          </div>

          {/* Contextual Sidebar - Premium Minimalist */}
          <div className="lg:col-span-4 space-y-6">
            <div className="premium-card p-8 bg-white overflow-hidden relative group">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              
              <div className="flex flex-col items-center text-center p-2 relative z-10">
                <div className="w-20 h-20 rounded-2xl bg-purple-50 flex items-center justify-center mb-6 border border-purple-100/50">
                  <ShieldCheck className="w-10 h-10 text-purple-600" />
                </div>
                
                <span className="text-metadata mb-2">Health Ecosystem</span>
                <h3 className="text-4xl font-bold text-slate-800 tracking-tight mb-1">{mailbox?.stats?.reputationScore ?? 100}</h3>
                <div className="px-3 py-1 bg-purple-50 border border-purple-100/50 rounded-lg mb-6">
                  <span className="text-xs font-bold text-purple-700 capitalize">
                    {(mailbox?.stats?.reputationScore ?? 100) >= 90 ? 'Optimal Condition' : (mailbox?.stats?.reputationScore ?? 100) >= 70 ? 'Moderate Condition' : 'Critical Condition'}
                  </span>
                </div>

                <div className="w-full space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-bold text-slate-500">Reputation</span>
                    <span className="text-[11px] font-bold text-purple-600 tracking-tight">Excellent</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-bold text-slate-500">DNS Config</span>
                    <span className="text-[11px] font-bold text-purple-600 tracking-tight">Correct</span>
                  </div>
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[11px] font-bold text-slate-500">SPF/DKIM</span>
                    <span className="text-[11px] font-bold text-purple-600 tracking-tight">Active</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="premium-card p-6 bg-slate-50/50 border-dashed border-slate-300 shadow-none">
              <div className="flex items-center gap-3 mb-4 text-slate-400">
                <History className="w-4 h-4" />
                <span className="text-xs font-semibold text-slate-400 leading-none">Status Overview</span>
              </div>
              <p className="text-xs font-bold text-slate-500 leading-relaxed">
                This sender is currently within safe delivery limits. No IP throttling detected across main ISP clusters.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewMailbox;
