import Modal from '../components/shared/modal';
import {
  FileText,
  Save,
  Type,
  MessageSquare,
  Zap,
  Database,
  CheckCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
  Shield,
  Layout,
  Settings,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import HtmlEmailEditor from '../components/shared/html-editor';
import Button from '../components/ui/button';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

const ShowTemplate = ({
  showTemplateModal,
  setShowTemplateModal,
  editingTemplate,
  formData,
  handleSaveTemplate,
  setFormData,
  editorMode,
  setEditorMode,
  defaultUserFields,
}) => {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(1);

  // Add sender_name to default user fields if not already present
  const allUserFields = [...defaultUserFields, { fieldName: 'sender_name', fieldType: 'text' }];

  if (!showTemplateModal) return null;

  // Steps configuration
  const steps = [
    {
      id: 1,
      name: t('modals.template.steps.details'),
      icon: Settings,
    },
    {
      id: 2,
      name: t('modals.template.steps.content'),
      icon: Layout,
    },
    {
      id: 3,
      name: t('modals.template.steps.review'),
      icon: Eye,
    },
  ];

  // Handle next step
  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error(t('modals.template.err.name_req'));
        return;
      }
      if (!formData.subject.trim()) {
        toast.error(t('modals.template.err.subject_req'));
        return;
      }
    }
    if (currentStep < steps.length) {
      setCurrentStep((s) => s + 1);
    }
  };

  // Handle previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  // Render step content
  const renderStep = () => {
    return (
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
                  {t('modals.template.fields.name')}
                </label>
                <div className="relative group">
                  <div className="absolute ltr:left-4 ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-blue-500">
                    <Type className="w-full h-full" />
                  </div>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-14 ltr:pl-12 ltr:pr-12 rtl:pl-12 ltr:pr-6 rtl:pl-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                    placeholder={t('modals.template.fields.placeholder_name')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
                  {t('modals.template.fields.subject')}
                </label>
                <div className="relative group">
                  <div className="absolute ltr:left-4 ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-blue-500">
                    <MessageSquare className="w-full h-full" />
                  </div>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-14 ltr:pl-12 ltr:pr-12 rtl:pl-12 ltr:pr-6 rtl:pl-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                    placeholder={t('modals.template.fields.placeholder_subject')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-1 bg-slate-50 border-2 border-slate-100 rounded-3xl">
                  <div
                    className={`p-4 rounded-2xl transition-all ${formData.status === 'active' ? 'bg-white shadow-sm ring-1 ring-slate-200' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.status === 'active'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-slate-100 text-slate-400'
                            }`}
                        >
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{t('modals.template.labels.status')}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {formData.status === 'active' ? t('common.status.active') : t('common.status.draft')}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.status === 'active'}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              status: e.target.checked ? 'active' : 'draft',
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-12 h-7 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-all duration-300 after:content-[''] after:absolute after:top-1 after:ltr:left-1 ltr:right-1 rtl:left-1 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5 shadow-sm"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-1 bg-slate-50 border-2 border-slate-100 rounded-3xl">
                  <div
                    className={`p-4 rounded-2xl transition-all ${formData.isDefault ? 'bg-white shadow-sm ring-1 ring-slate-200' : ''
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isDefault
                            ? 'bg-purple-50 text-purple-600'
                            : 'bg-slate-100 text-slate-400'
                            }`}
                        >
                          <Shield className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{t('modals.template.labels.primary')}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {formData.isDefault ? t('modals.template.labels.default') : t('modals.template.labels.standard')}
                          </p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isDefault: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-12 h-7 bg-slate-200 peer-checked:bg-purple-600 rounded-full transition-all duration-300 after:content-[''] after:absolute after:top-1 after:ltr:left-1 ltr:right-1 rtl:left-1 after:bg-white after:w-5 after:h-5 after:rounded-full after:transition-all peer-checked:after:translate-x-5 shadow-sm"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl border border-slate-200">
              <div className="flex gap-1">
                <button
                  onClick={() => setEditorMode('rich')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all ${editorMode === 'rich'
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  <Sparkles className="w-4 h-4 inline ltr:mr-2 rtl:ml-2" />
                  {t('modals.template.labels.visual')}
                </button>
                <button
                  onClick={() => setEditorMode('text')}
                  className={`px-6 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest transition-all ${editorMode === 'text'
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                    : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                  {t('modals.template.labels.html')}
                </button>
              </div>
              <div className="flex items-center gap-2 px-4 ltr:border-l ltr:border-r rtl:border-l border-slate-200">
                <Database className="w-4 h-4 text-slate-400" />
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  {t('modals.template.labels.merge_tags')}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 group p-3 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              {allUserFields.map((field, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const token = `{{${field.fieldName}}}`;
                    if (editorMode === 'text') {
                      const textarea = document.querySelector('textarea[name="htmlContent"]');
                      if (textarea) {
                        const start = textarea.selectionStart;
                        const end = textarea.selectionEnd;
                        textarea.value =
                          textarea.value.substring(0, start) +
                          token +
                          textarea.value.substring(end);
                        setFormData({
                          ...formData,
                          htmlContent: textarea.value,
                        });
                      }
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-blue-600 font-mono text-[10px] font-bold hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  {'{{'} {field.fieldName} {'}}'}
                </button>
              ))}
            </div>

            <div className="border border-slate-200 rounded-3xl bg-white overflow-hidden min-h-100">
              {editorMode === 'rich' ? (
                <HtmlEmailEditor
                  value={formData.htmlContent}
                  onChange={(html) => setFormData({ ...formData, htmlContent: html })}
                  userFields={allUserFields}
                />
              ) : (
                <textarea
                  name="htmlContent"
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  className="w-full h-100 p-6 font-mono text-sm bg-slate-900 text-slate-300 outline-none resize-none"
                  placeholder={t('modals.template.fields.placeholder_content')}
                />
              )}
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                  {t('common.summary')}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-500">{t('common.fields.name')}</span>
                    <span className="text-sm font-extrabold text-slate-800">{formData.name}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-xs font-bold text-slate-500">{t('common.fields.subject')}</span>
                    <span className="text-sm font-extrabold text-slate-800 truncate max-w-50">
                      {formData.subject}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">{t('modals.template.labels.status')}</span>
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-widest ${formData.status === 'active'
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-blue-100 text-blue-600'
                        }`}
                    >
                      {formData.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4">
                  {t('settings.tabs.security')}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${formData.isDefault
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-slate-200 text-slate-400'
                        }`}
                    >
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{t('modals.template.labels.default')}</p>
                      <p className="text-[10px] text-slate-400">
                        {formData.isDefault ? t('modals.template.labels.default') : t('common.not_set')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-3xl bg-white overflow-hidden shadow-sm flex flex-col">
              <div className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                </div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200/60 shadow-xs">
                  {t('modals.template.labels.canvas')}
                </div>
              </div>
              <div className="p-8 md:p-10 min-h-62.5 max-h-100 overflow-y-auto custom-scrollbar">
                <div
                  className="prose prose-slate max-w-none text-slate-800 mail-content-html preview-content"
                  dangerouslySetInnerHTML={{
                    __html: formData.htmlContent
                      ? formData.htmlContent.replace(
                        /\{\{([^}]+)\}\}/g,
                        `<span class="bg-amber-100/80 text-amber-800 px-1.5 py-0.5 rounded-md font-mono text-sm font-bold border border-amber-200/60 leading-none shadow-sm pb-1 inline-block">$&</span>`,
                      )
                      : `<p class='text-slate-400 italic'>${t('modals.template.labels.no_preview')}</p>`,
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <Modal
      isOpen={showTemplateModal}
      onClose={() => setShowTemplateModal(false)}
      maxWidth="max-w-4xl"
      closeOnBackdrop={true}
    >
      <div className="relative bg-white flex flex-col h-full max-h-[90vh]">
        {/* Modern Header */}
        <div className="px-8 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 uppercase tracking-tighter">
                  {editingTemplate ? t('modals.template.title.edit') : t('modals.template.title.new')}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {t('modals.template.steps.status', { current: currentStep, total: steps.length, name: steps[currentStep - 1].name })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
              {steps.map((step) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                  <button
                    key={step.id}
                    onClick={() => isCompleted && setCurrentStep(step.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isActive
                      ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                      : isCompleted
                        ? 'text-emerald-600 hover:bg-emerald-50'
                        : 'text-slate-300 opacity-50 cursor-not-allowed'
                      }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="text-[10px] font-extrabold uppercase tracking-widest hidden md:block">
                      {step.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-8 py-6">{renderStep()}</div>

        {/* Improved Footer */}
        <div className="px-8 py-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <button
            onClick={() => setShowTemplateModal(false)}
            className="px-6 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-800 transition-all"
          >
            {t('common.cancel')}
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePreviousStep}
                className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-600 hover:border-slate-300 transition-all active:scale-95 flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('common.back')}
              </button>
            )}

            {currentStep < steps.length ? (
              <Button
                onClick={handleNextStep}
                variant="primary"
                className="px-10 py-3 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
              >
                {t('common.continue')}
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <button
                onClick={handleSaveTemplate}
                disabled={
                  !formData.name.trim() || !formData.subject.trim() || !formData.htmlContent.trim()
                }
                className="px-10 py-3 bg-blue-600 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingTemplate ? t('modals.template.btn.update') : t('modals.template.btn.save')}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShowTemplate;
