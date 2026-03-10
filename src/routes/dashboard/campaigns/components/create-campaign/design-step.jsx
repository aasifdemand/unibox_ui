import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Layout, Tag, Plus, Clock, MessageSquare, Trash2, Mail } from 'lucide-react';
import HtmlEmailEditor from '../../../../../components/shared/html-editor';
import PersonalizationTokens from '../../../../../components/shared/personalization-tokens';
import HighlightedInput from '../../../../../components/shared/highlighted-input';


const getPlaceholders = (t) => [
  {
    key: 'first_name',
    label: t('campaigns.ph_first_name'),
    example: 'John',
    category: t('campaigns.cat_basic'),
  },
  { key: 'last_name', label: t('campaigns.ph_last_name'), example: 'Doe', category: t('campaigns.cat_basic') },
  {
    key: 'name',
    label: t('campaigns.ph_full_name'),
    example: 'John Doe',
    category: t('campaigns.cat_basic'),
  },
  {
    key: 'email',
    label: t('campaigns.ph_email'),
    example: 'john@example.com',
    category: t('campaigns.cat_basic'),
  },
  {
    key: 'company',
    label: t('campaigns.ph_company'),
    example: 'Acme Inc',
    category: t('campaigns.cat_professional'),
  },
  {
    key: 'job_title',
    label: t('campaigns.ph_job_title'),
    example: 'Marketing Manager',
    category: t('campaigns.cat_professional'),
  },
  { key: 'city', label: t('campaigns.ph_city'), example: 'New York', category: t('campaigns.cat_location') },
  {
    key: 'country',
    label: t('campaigns.ph_country'),
    example: 'USA',
    category: t('campaigns.cat_location'),
  },
  {
    key: 'phone',
    label: t('campaigns.ph_phone'),
    example: '+1 234 567 890',
    category: t('campaigns.cat_contact'),
  },
  {
    key: 'role',
    label: t('campaigns.ph_role'),
    example: 'CEO',
    category: t('campaigns.cat_professional'),
  },
  {
    key: 'industry',
    label: t('campaigns.ph_industry'),
    example: 'Software',
    category: t('campaigns.cat_professional'),
  },
  {
    key: 'sender_name',
    label: t('campaigns.ph_sender_name'),
    example: 'Your Name',
    category: t('campaigns.cat_system'),
  },
  {
    key: 'unsubscribe_link',
    label: t('campaigns.ph_unsubscribe'),
    example: '[unsubscribe link]',
    category: t('campaigns.cat_system'),
  },
];

const Step1Design = ({
  register,
  errors,
  watch,
  setValue,
  selectedBatch,
  selectedSender,
}) => {
  const { t } = useTranslation();
  const [activeStepIndex, setActiveStepIndex] = useState(0); // 0 = Main, 1+ = Follow-ups
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [subjectTokenQuery, setSubjectTokenQuery] = useState('');
  const [subjectDropdownPos, setSubjectDropdownPos] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);

  const subjectInputRef = useRef(null);
  const highlightedInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Watchers
  const campaignName = watch('name');
  const mainSubject = watch('subject') || '';
  const mainHtmlBody = watch('htmlBody') || '';
  const steps = watch('steps') || [];

  // Helper to get current editing content
  const currentSubject = activeStepIndex === 0 ? mainSubject : steps[activeStepIndex - 1]?.subject || '';
  const currentHtmlBody = activeStepIndex === 0 ? mainHtmlBody : steps[activeStepIndex - 1]?.htmlBody || '';

  const setContent = (val) => {
    if (activeStepIndex === 0) {
      setValue('htmlBody', val, { shouldValidate: true });
    } else {
      const newSteps = [...steps];
      newSteps[activeStepIndex - 1].htmlBody = val;
      setValue('steps', newSteps, { shouldValidate: true });
    }
  };

  const setSubject = (val) => {
    if (activeStepIndex === 0) {
      setValue('subject', val, { shouldValidate: true });
    } else {
      const newSteps = [...steps];
      newSteps[activeStepIndex - 1].subject = val;
      setValue('steps', newSteps, { shouldValidate: true });
    }
  };

  const addFollowUp = () => {
    const nextOrder = steps.length + 1;
    const newStep = {
      stepOrder: nextOrder,
      subject: activeStepIndex === 0 ? `Re: ${mainSubject}` : `Re: ${steps[activeStepIndex - 1].subject}`,
      htmlBody: '',
      textBody: '',
      delayMinutes: 4320, // 3 days
      condition: 'no_reply',
    };
    setValue('steps', [...steps, newStep]);
    setActiveStepIndex(steps.length + 1);
  };

  const removeFollowUp = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Re-index steps
    const reindexed = newSteps.map((s, i) => ({ ...s, stepOrder: i + 1 }));
    setValue('steps', reindexed);
    if (activeStepIndex > index + 1) setActiveStepIndex(activeStepIndex - 1);
    else if (activeStepIndex === index + 1) setActiveStepIndex(0);
  };

  const updateDelay = (index, value) => {
    const newSteps = [...steps];
    newSteps[index].delayMinutes = parseInt(value);
    setValue('steps', newSteps);
  };

  const updateCondition = (index, value) => {
    const newSteps = [...steps];
    newSteps[index].condition = value;
    setValue('steps', newSteps);
  };

  // Dynamic Placeholders Logic
  const allPlaceholders = useMemo(() => {
    const staticPlaceholders = getPlaceholders(t);
    const mapping = selectedBatch?.mapping || {};

    const dynamicItems = Object.entries(mapping).map(([slug, label]) => {
      // Check if we already have a static placeholder for this slug
      const existing = staticPlaceholders.find((s) => s.key === slug);
      if (existing) return existing;

      return {
        key: slug,
        label: label,
        example: `[${label}]`,
        category: t('campaigns.cat_custom'),
      };
    });

    // Deduplicate and combine
    const combined = [...staticPlaceholders];
    dynamicItems.forEach(item => {
      if (!combined.find(c => c.key === item.key)) {
        combined.push(item);
      }
    });

    return combined;
  }, [selectedBatch, t]);

  const availableFields = useMemo(() => {
    return allPlaceholders.map(p => ({
      fieldName: p.key,
      displayName: p.label
    }));
  }, [allPlaceholders]);

  const filteredSuggestions = useMemo(() => {
    return allPlaceholders.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [allPlaceholders]);

  const insertPlaceholder = (placeholderKey) => {
    const textBeforeTrigger = currentSubject.substring(0, cursorPosition).lastIndexOf('{{');

    if (textBeforeTrigger !== -1) {
      const textBefore = currentSubject.substring(0, textBeforeTrigger);
      const textAfter = currentSubject.substring(cursorPosition);
      const newValue = textBefore + `{{${placeholderKey}}}` + textAfter;
      setSubject(newValue);
    } else {
      // Fallback
      const textBeforeCursor = currentSubject.slice(0, cursorPosition);
      const textAfterCursor = currentSubject.slice(cursorPosition);
      const newValue = textBeforeCursor + `{{${placeholderKey}}}` + textAfterCursor;
      setSubject(newValue);
    }

    setShowSubjectSuggestions(false);
    setSubjectTokenQuery('');
  };

  const triggerTokenDropdown = () => {
    if (highlightedInputRef.current?.editor) {
      const editor = highlightedInputRef.current.editor;
      editor.chain().focus().insertContent('{{').run();
    }
  };



  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[600px] animate-in fade-in duration-700">
      {/* LEFT SIDEBAR: Step Navigation */}
      <div className="lg:w-72 shrink-0 space-y-4">
        <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-4 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-3 mb-4">
            Campaign Sequence
          </p>

          {/* Step 0: Main Email */}
          <button
            type="button"
            onClick={() => setActiveStepIndex(0)}
            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeStepIndex === 0
              ? 'bg-white shadow-xl shadow-blue-500/5 border border-blue-100 ring-2 ring-blue-500/10'
              : 'hover:bg-white/60 text-slate-500'
              }`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeStepIndex === 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className={`text-[10px] font-black uppercase tracking-tight ${activeStepIndex === 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                Step 1: Main
              </p>
              <p className="text-[11px] font-bold truncate max-w-full">
                {mainSubject || 'No Subject'}
              </p>
            </div>
          </button>

          {/* Follow-up Steps */}
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <button
                type="button"
                onClick={() => setActiveStepIndex(idx + 1)}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeStepIndex === idx + 1
                  ? 'bg-white shadow-xl shadow-blue-500/5 border border-blue-100 ring-2 ring-blue-500/10'
                  : 'hover:bg-white/60 text-slate-500'
                  }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${activeStepIndex === idx + 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className={`text-[10px] font-black uppercase tracking-tight ${activeStepIndex === idx + 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                      Step {idx + 2}: Follow-up
                    </p>
                  </div>
                  <p className="text-[11px] font-bold truncate">
                    {step.subject || 'No Subject'}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span className="text-[9px] font-bold text-slate-400 uppercase">
                      Wait {Math.round(step.delayMinutes / 1440)}d
                    </span>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeFollowUp(idx); }}
                className="absolute top-2 right-2 p-1.5 bg-rose-50 text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500 hover:text-white"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addFollowUp}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-bold text-[10px] uppercase tracking-widest mt-4"
          >
            <Plus className="w-4 h-4" />
            Add Follow-up
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2rem] p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">
              Sequence Logic
            </span>
          </div>
          <p className="text-[11px] text-indigo-600/80 leading-relaxed font-medium">
            Sequence follows the order shown here. If a recipient replies, all future steps are automatically stopped.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Editor Area */}
      <div className="flex-1 space-y-6">
        {/* Step Header / Delay Controls */}
        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                {activeStepIndex === 0 ? 'Main Campaign Email' : `Follow-up Email #${activeStepIndex}`}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Editing step {activeStepIndex + 1} of {steps.length + 1}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {activeStepIndex > 0 && (
                <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Wait for
                    </span>
                    <select
                      value={steps[activeStepIndex - 1].delayMinutes}
                      onChange={(e) => updateDelay(activeStepIndex - 1, e.target.value)}
                      className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer"
                    >
                      <option value={1440}>1 Day</option>
                      <option value={2880}>2 Days</option>
                      <option value={4320}>3 Days</option>
                      <option value={7200}>5 Days</option>
                      <option value={10080}>7 Days</option>
                      <option value={20160}>14 Days</option>
                    </select>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">
                      Condition
                    </span>
                    <select
                      value={steps[activeStepIndex - 1].condition}
                      onChange={(e) => updateCondition(activeStepIndex - 1, e.target.value)}
                      className="bg-transparent text-sm font-bold text-indigo-600 outline-none cursor-pointer uppercase tracking-tighter"
                    >
                      <option value="no_reply">IF NO REPLY</option>
                      <option value="always">ALWAYS SEND</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subject Area */}
        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              Subject Line *
            </label>
            <button
              type="button"
              onClick={triggerTokenDropdown}
              className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 flex items-center gap-1.5"
            >
              <Tag className="w-3 h-3" /> Insert Variable
            </button>
          </div>
          <div className="relative">
            <HighlightedInput
              ref={highlightedInputRef}
              value={currentSubject}
              onChange={setSubject}
              placeholder="e.g., Hi {{first_name}}!"
              userFields={[
                ...availableFields,
                { fieldName: 'sender_name', displayName: 'Sender Name' },
              ]}
            />
            {errors.subject && (
              <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest mt-2 px-2">
                {errors.subject.message}
              </p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-2xl">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 py-2">
            Message Content
          </p>
        </div>

        <div className="border-2 border-slate-100 rounded-[2rem] bg-slate-50/30 overflow-hidden shadow-sm p-3">
          <div className="bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 h-full shadow-inner">
            <HtmlEmailEditor
              value={currentHtmlBody}
              onChange={setContent}
              userFields={[
                ...availableFields,
                { fieldName: 'sender_name', displayName: 'Sender Name' },
              ]}
              senderName={selectedSender?.name || ''}
            />
          </div>
        </div>
      </div >


    </div >
  );
};

export default Step1Design;
