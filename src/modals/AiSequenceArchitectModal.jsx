import { useTranslation } from 'react-i18next';
import { Sparkles, Shield, ChevronDown, Tag, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import Modal from '../components/shared/modal';

const AiSequenceArchitectModal = ({
  isOpen,
  onClose,
  aiGoal,
  setAiGoal,
  aiTone,
  setAiTone,
  stepsCount,
  setStepsCount,
  handleAiGenerate,
  isGenerating,
}) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <div className="overflow-hidden">
        {/* Premium Header */}
        <div className="bg-linear-to-br from-purple-600 to-purple-700 p-8 relative overflow-hidden group">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.1 }}
            className="absolute top-0 right-0 p-8 group-hover:scale-110 transition-transform"
          >
            <Shield className="w-24 h-24 text-white" />
          </motion.div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center border border-white/30 backdrop-blur-sm"
              >
                <Sparkles className="w-7 h-7 text-white animate-pulse" />
              </motion.div>
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-2xl font-bold text-white tracking-tight leading-none">
                  {t('campaigns.design.ai_modal_title', 'AI Sequence Architect')}
                </h2>
                <p className="text-xs font-semibold text-white/70 mt-1">
                  {t('campaigns.design.ai_modal_subtitle', 'Architect your entire sequence in seconds.')}
                </p>
              </motion.div>
            </div>
            
           
          </div>
        </div>

        <div className="p-8 space-y-8 relative z-10 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-12 space-y-6">
              {/* Goal Field */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 px-1">
                  {t('campaigns.design.goal_label', "What's your campaign goal?")}
                </label>
                <textarea
                  className="w-full h-28 bg-slate-50/50 border-2 border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-700 focus:ring-12 focus:ring-purple-500/5 focus:border-purple-500/50 focus:bg-white outline-none transition-all resize-none placeholder:text-slate-300 placeholder:font-medium leading-relaxed shadow-inner"
                  placeholder={t('campaigns.design.goal_placeholder', "e.g. Promote our new SEO tool to marketing agencies in the UK. Target audience: SaaS Founders. Value Prop: We find 20% more broken links than competitors.")}
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tone Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 px-1">
                    {t('campaigns.design.tone_label', 'Tone of Voice')}
                  </label>
                  <div className="relative group/select">
                    <select
                      className="w-full h-10 pl-4 pr-10 bg-slate-50/50 border-2 border-slate-100 rounded-lg text-[13px] font-bold text-slate-700 hover:border-purple-200 focus:ring-12 focus:ring-purple-500/5 focus:border-purple-500/50 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                    >
                      <option value="professional">{t('campaigns.design.tone_professional', 'Professional & Bold')}</option>
                      <option value="casual">{t('campaigns.design.tone_casual', 'Casual & Friendly')}</option>
                      <option value="urgent">{t('campaigns.design.tone_urgent', 'Urgent & Direct')}</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within/select:text-purple-500 transition-colors" />
                  </div>
                </div>

                {/* Length Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 px-1">
                    {t('campaigns.design.sequence_length', 'Sequence Length')}
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setStepsCount(num)}
                        className={`h-10 rounded-lg text-xs font-black transition-all flex flex-col items-center justify-center border-2 group relative overflow-hidden ${
                          stepsCount === num
                            ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/30 scale-105 z-10'
                            : 'bg-slate-50/50 border-slate-100 text-slate-400 hover:border-purple-200 hover:bg-white'
                        }`}
                      >
                        <span className="relative z-10">{num}</span>
                        <span className={`text-[8px] relative z-10 uppercase tracking-tight ${stepsCount === num ? 'text-white/70' : 'text-slate-300'}`}>
                          {num === 1 ? 'Step' : 'Steps'}
                        </span>
                        {num === 3 && stepsCount !== num && (
                          <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* SMART TIPS SECTION */}
          <div className="p-4 bg-slate-50/50 border-2 border-slate-100 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-md">
                <Tag className="w-3 h-3 text-purple-600" />
              </div>
              <h4 className="text-xs font-bold text-slate-500">
                {t('campaigns.design.tips', 'Smart Personalization Tips')}
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: 'Spintax', text: t('campaigns.design.tip_spintax', 'Use curly braces for Spintax: {Hi|Hello|Hey}') },
                { title: 'Safe Logic', text: t('campaigns.design.tip_logic', 'AI uses {{#if}} for safe custom variable fallbacks.') },
                { title: 'System Tags', text: t('campaigns.design.tip_tags', 'System tags: {{sl_time_of_day}}, {{sl_day_of_week}}') },
              ].map((tip, i) => (
                <div key={i} className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">{tip.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">{tip.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleAiGenerate}
              disabled={isGenerating || !aiGoal.trim()}
              className="w-full h-12 bg-purple-600 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-600/20 hover:bg-purple-700 hover:-translate-y-px active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:translate-y-0 disabled:active:scale-100 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-linear-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span className="animate-pulse">{t('campaigns.design.generating', 'Architecting Sequence...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
                  {t('campaigns.design.generate_btn', 'Generate Sequence')}
                </>
              )}
            </button>

            <div className="flex items-center gap-2 justify-center text-[10px] font-bold text-slate-400 bg-slate-50/50 py-2 rounded-lg border border-slate-100">
              <AlertCircle className="w-3 h-3 text-purple-500" />
              <span>{t('campaigns.design.warning_replace', 'Warning: This will replace your current sequence draft')}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AiSequenceArchitectModal;
