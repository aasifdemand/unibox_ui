/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Plus, Clock, MessageSquare, Trash2, Mail, Loader2, Sparkles, AlertCircle, Zap, X, ChevronDown } from 'lucide-react';
import HtmlEmailEditor from '../../../../../components/shared/html-editor';
import HighlightedInput from '../../../../../components/shared/highlighted-input';
import Modal from '../../../../../components/shared/modal';
import { useGenerateSequence } from '../../../../../hooks/useAi';
import { toast } from 'react-hot-toast';

const getPlaceholders = (t) => [
  {
    key: 'first_name',
    label: t('campaigns.ph_first_name'),
    example: 'John',
    category: t('campaigns.cat_basic'),
  },
  {
    key: 'last_name',
    label: t('campaigns.ph_last_name'),
    example: 'Doe',
    category: t('campaigns.cat_basic'),
  },
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
    key: 'website',
    label: t('campaigns.ph_website') || 'Website',
    example: 'https://acme.inc',
    category: t('campaigns.cat_professional'),
  },
  {
    key: 'linkedin_url',
    label: t('campaigns.ph_linkedin') || 'LinkedIn URL',
    example: 'linkedin.com/in/johndoe',
    category: t('campaigns.cat_professional'),
  },
  {
    key: 'job_title',
    label: t('campaigns.ph_job_title'),
    example: 'Marketing Manager',
    category: t('campaigns.cat_professional'),
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
    key: 'employees',
    label: t('campaigns.ph_employees') || 'Employee Count',
    example: '51-200',
    category: t('campaigns.cat_professional'),
  },
  {
    key: 'revenue',
    label: t('campaigns.ph_revenue') || 'Annual Revenue',
    example: '$10M',
    category: t('campaigns.cat_professional'),
  },
  {
    key: 'tech_stack',
    label: t('campaigns.ph_tech_stack') || 'Tech Stack',
    example: 'Salesforce, React, AWS',
    category: t('campaigns.cat_professional'),
  },
  {
    key: 'recent_funding',
    label: t('campaigns.ph_funding') || 'Recent Funding',
    example: 'Series B ($20M)',
    category: t('campaigns.cat_professional'),
  },
  {
    key: 'city',
    label: t('campaigns.ph_city'),
    example: 'New York',
    category: t('campaigns.cat_location'),
  },
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
    key: 'pain_point',
    label: t('campaigns.ph_pain_point') || 'Pain Point',
    example: 'High customer churn',
    category: t('campaigns.cat_custom'),
  },
  {
    key: 'competitor',
    label: t('campaigns.ph_competitor') || 'Competitor',
    example: 'Acme Corp',
    category: t('campaigns.cat_custom'),
  },
  {
    key: 'sender_name',
    label: t('campaigns.ph_sender_name'),
    example: 'Your Name',
    category: t('campaigns.cat_system'),
  },
  {
    key: 'sl_time_of_day',
    label: 'Smart: Time of Day',
    example: 'morning/afternoon/evening',
    category: t('campaigns.cat_system'),
  },
  {
    key: 'sl_day_of_week',
    label: 'Smart: Day of Week',
    example: 'Monday',
    category: t('campaigns.cat_system'),
  },
  {
    key: 'sl_current_month',
    label: 'Smart: Current Month',
    example: 'March',
    category: t('campaigns.cat_system'),
  },
];

const Step1Design = ({ watch, setValue, selectedBatch, selectedSender }) => {
  const { t } = useTranslation();
  const [activeStepIndex, setActiveStepIndex] = useState(0); // 0 = Main, 1+ = Follow-ups
  const [manualPlaceholders, setManualPlaceholders] = useState([]);
  const [stepsCount, setStepsCount] = useState(3);

  const highlightedInputRef = useRef(null);

  // AI State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const generateAi = useGenerateSequence();

  // Watchers
  const mainSubject = watch('subject') || '';
  const mainHtmlBody = watch('htmlBody') || '';
  const steps = watch('steps') || [];

  // Helper to get current editing content
  const currentSubject =
    activeStepIndex === 0 ? mainSubject : steps[activeStepIndex - 1]?.subject || '';
  const currentHtmlBody =
    activeStepIndex === 0 ? mainHtmlBody : steps[activeStepIndex - 1]?.htmlBody || '';

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
      subject:
        activeStepIndex === 0 ? `Re: ${mainSubject}` : `Re: ${steps[activeStepIndex - 1].subject}`,
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
    
    // Add dynamic items from mapping
    dynamicItems.forEach((item) => {
      if (!combined.find((c) => c.key === item.key)) {
        combined.push(item);
      }
    });

    // Add manual placeholders
    manualPlaceholders.forEach((token) => {
      if (!combined.find((c) => c.key === token)) {
        combined.push({
          key: token,
          label: token.charAt(0).toUpperCase() + token.slice(1).replace(/_/g, ' '),
          example: `[${token}]`,
          category: t('campaigns.cat_custom'),
          isManual: true,
        });
      }
    });

    return combined;
  }, [selectedBatch, t, manualPlaceholders]);

  const registerPlaceholder = (key) => {
    if (!key) return;
    const cleanKey = key.replace(/[{}]/g, '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!allPlaceholders.find(p => p.key === cleanKey)) {
      setManualPlaceholders(prev => [...prev, cleanKey]);
    }
  };

  const availableFields = useMemo(() => {
    return allPlaceholders.map((p) => ({
      fieldName: p.key,
      displayName: p.label,
    }));
  }, [allPlaceholders]);

  // Campaign Health Check Logic
  const usedVariables = useMemo(() => {
    const allText = [
      mainSubject,
      mainHtmlBody,
      ...steps.map((s) => (s.subject || '') + ' ' + (s.htmlBody || '')),
    ].join(' ');
    const matches = allText.match(/{{\s*([\w.#/]+)\s*}}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, '').replace(/[#/]/g, '').trim()))].filter(
      (v) => v !== 'else' && v !== 'if'
    );
  }, [mainSubject, mainHtmlBody, steps]);

  const missingVariables = useMemo(() => {
    const systemTags = ['sl_time_of_day', 'sl_day_of_week', 'sl_current_month', 'sl_current_date', 'unsubscribe_link', 'sender_name', 'first_name', 'company']; // common defaults
    return usedVariables.filter((v) => {
      if (systemTags.includes(v)) return false;
      return !availableFields.find((f) => f.fieldName === v);
    });
  }, [usedVariables, availableFields]);

  const triggerTokenDropdown = () => {
    if (highlightedInputRef.current?.editor) {
      const editor = highlightedInputRef.current.editor;
      editor.chain().focus().insertContent('{{').run();
    }
  };

  const getBodySnippet = (html) => {
    if (!html) return 'Enter your email body here...';
    // Better regex to strip HTML tags for snippet
    const text = html
      .replace(/<[^>]*>?/gm, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return text.substring(0, 100) + (text.length > 100 ? '...' : '');
  };

  const handleAiGenerate = async () => {
    if (!aiGoal.trim()) {
      toast.error('Please enter a goal for your campaign');
      return;
    }

    try {
      const variables = allPlaceholders.map((p) => p.key);
      const sequence = await generateAi.mutateAsync({ 
        goal: aiGoal, 
        tone: aiTone, 
        stepsCount, 
        variables 
      });

      if (sequence && sequence.length > 0) {
        // Auto-register any new placeholders AI might have invented
        const allText = sequence.map((s) => s.subject + ' ' + s.body).join(' ');
        const foundTokens = allText.match(/{{\s*([\w.]+)\s*}}/g) || [];
        foundTokens.forEach((token) => registerPlaceholder(token));

        // Set Main Email (Step 0)
        setValue('subject', sequence[0].subject, { shouldValidate: true });
        setValue('htmlBody', sequence[0].body, { shouldValidate: true });

        // Set Follow-ups (Step 1+)
        const followUps = sequence.slice(1).map((s, i) => ({
          stepOrder: i + 1,
          subject: s.subject,
          htmlBody: s.body, // Mapping AI 'body' to 'htmlBody'
          textBody: '',
          delayMinutes: 4320 * (i + 1), // 3 days, 6 days, etc.
          condition: 'no_reply',
        }));

        setValue('steps', followUps, { shouldValidate: true });
        setActiveStepIndex(0); // Switch to main email view
        setIsAiModalOpen(false);
        setAiGoal('');
        toast.success('Campaign sequence generated successfully!');
      }
    } catch (error) {
      console.error('AI Generation Failed:', error);
      toast.error('Failed to generate sequence. Please try again.');
    }
  };

  return (
    <div className="flex gap-0 min-h-screen bg-white animate-in fade-in duration-700">
      {/* LEFT SIDEBAR: Vertical Timeline with Background */}
      <div className="w-[320px] shrink-0 bg-[#fbfcfd] border-r border-slate-100 flex flex-col p-10 relative overflow-y-auto">
        <div className="absolute left-[59px] top-16 bottom-16 w-[1.5px] bg-slate-200" />

        <div className="space-y-10 relative">
          {/* Main Step Node */}
          <div className="relative group">
            <div
              className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-white z-10 ${activeStepIndex === 0 ? 'border-orange-600 ring-4 ring-orange-50' : 'border-slate-200'}`}
            >
              <Mail
                className={`w-4 h-4 ${activeStepIndex === 0 ? 'text-orange-600' : 'text-slate-400'}`}
              />
            </div>

            <div className="ml-14 space-y-2">
              <p className="text-[11px] font-bold text-slate-800 tracking-tight">Email follow up</p>
              <button
                type="button"
                onClick={() => setActiveStepIndex(0)}
                className={`w-full text-left p-3 rounded-md border transition-all ${activeStepIndex === 0 ? 'border-orange-600 border-l-4 bg-white shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-bold text-slate-400">Email</span>
                  <p className="text-[11px] font-bold text-slate-600 truncate">
                    Subject: {mainSubject || '----'}
                  </p>
                </div>
              </button>
              <button className="text-[10px] font-bold text-orange-600 hover:text-orange-700 ml-1">
                + Add Variant
              </button>
            </div>
          </div>

          {/* Follow-up nodes */}
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border flex items-center justify-center transition-all bg-white z-10 ${activeStepIndex === idx + 1 ? 'border-orange-600 ring-4 ring-orange-50' : 'border-slate-200'}`}
              >
                <MessageSquare
                  className={`w-4 h-4 ${activeStepIndex === idx + 1 ? 'text-orange-600' : 'text-slate-400'}`}
                />
              </div>

              <div className="ml-14 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-800 tracking-tight">
                    Follow-up #{idx + 1}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFollowUp(idx)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-orange-400 hover:text-orange-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveStepIndex(idx + 1)}
                  className={`w-full text-left p-3 rounded-md border transition-all ${activeStepIndex === idx + 1 ? 'border-orange-600 border-l-4 bg-white shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400">
                      Wait {Math.round(step.delayMinutes / 1440)} days
                    </span>
                    <p className="text-[11px] font-bold text-slate-600 truncate">
                      Subject: {step.subject || '----'}
                    </p>
                  </div>
                </button>
                <button className="text-[10px] font-bold text-orange-600 hover:text-orange-700 ml-1">
                  + Add Variant
                </button>
              </div>
            </div>
          ))}

          {/* Add Step Node */}
          <div className="relative pt-4">
            <button
              type="button"
              onClick={addFollowUp}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-sm shadow-orange-600/30 hover:scale-110 transition-all z-10"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={addFollowUp}
              className="ml-14 text-[11px] font-bold text-orange-600 hover:text-orange-700 uppercase tracking-widest"
            >
              Add step
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Editor Area with light background */}
      <div className="flex-1 bg-[#F9FAFB] overflow-y-auto p-10 space-y-6">
        {/* Inbox Preview Bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-bold text-slate-800">Inbox Preview</h3>
            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[8px] text-slate-400 cursor-help font-black">
              i
            </div>
          </div>

          <div className="bg-[#f8f9fc] border border-slate-100 rounded-lg p-4 flex items-center gap-6 group hover:bg-white hover:shadow-sm hover:shadow-slate-200/50 transition-all cursor-default">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-5 h-5 rounded border border-slate-200 bg-white" />
              <Tag className="w-4 h-4 text-slate-200 group-hover:text-amber-400 transition-colors" />
              <span className="text-[11px] font-bold text-slate-900 shrink-0 uppercase tracking-tighter">
                Unibox
              </span>
            </div>
            <div className="flex-1 min-w-0 flex items-baseline gap-2">
              <span className="text-[11px] font-bold text-slate-900 truncate">
                {currentSubject || 'Your subject line will display here'}
              </span>
              <span className="text-[11px] text-slate-400 truncate font-medium">
                {getBodySnippet(currentHtmlBody)}
              </span>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-4 h-4 text-orange-400 rotate-45" />
            </div>
          </div>
        </div>

        {/* Editor Main Section */}
        <div className="bg-white border-2 border-[#eaecf0] rounded-lg shadow-sm flex flex-col min-h-[500px] overflow-hidden">
          {/* Header row */}
          <div className="px-6 py-4 border-b border-[#eaecf0] flex items-center justify-between bg-white sticky top-0 z-10">
            <h2 className="text-sm font-bold text-slate-700">Stage {activeStepIndex + 1}: Email</h2>
          </div>

          {/* Follow-up Settings Bar */}
          {activeStepIndex > 0 && (
            <div className="px-6 py-4 border-b border-[#eaecf0] bg-orange-50/30 flex items-center gap-6 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                  Wait
                </span>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={Math.round(steps[activeStepIndex - 1]?.delayMinutes / 1440) || 1}
                    onChange={(e) =>
                      updateDelay(activeStepIndex - 1, parseInt(e.target.value) * 1440)
                    }
                    className="w-12 h-8 bg-white border border-orange-100 rounded-lg text-center text-xs font-bold text-orange-600 focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                  <span className="ml-2 text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                    Days
                  </span>
                </div>
              </div>

              <div className="h-4 w-px bg-orange-100" />

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">
                  Send if
                </span>
                <select
                  value={steps[activeStepIndex - 1]?.condition || 'no_reply'}
                  onChange={(e) => updateCondition(activeStepIndex - 1, e.target.value)}
                  className="h-8 bg-white border border-orange-100 rounded-lg px-2 text-xs font-bold text-orange-600 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
                >
                  <option value="no_reply">No Reply</option>
                  <option value="on_open">Open Recorded</option>
                  <option value="on_click">Link Clicked</option>
                  <option value="always">Always Send</option>
                </select>
              </div>
            </div>
          )}

          {/* Subject Row */}
          <div className="px-6 py-3 border-b border-[#eaecf0] flex items-center gap-4">
            <span className="text-[11px] font-bold text-slate-400 w-16">Subject:</span>
            <div className="flex-1 relative">
              <HighlightedInput
                ref={highlightedInputRef}
                value={currentSubject}
                onChange={setSubject}
                placeholder="Hi {{first_name}}"
                className="text-[13px] font-medium border-none bg-transparent! p-0 focus:ring-0 placeholder:text-slate-300 w-full"
                userFields={[
                  ...availableFields,
                  { fieldName: 'sender_name', displayName: 'Sender Name' },
                ]}
              />
            </div>
            <button
              type="button"
              onClick={triggerTokenDropdown}
              className="flex items-center gap-1.5 text-orange-600 hover:text-orange-700 transition-all font-bold"
            >
              <span className="text-sm">{'{ }'}</span>
              <span className="text-[11px] tracking-tight uppercase">Variables</span>
            </button>

            {/* Quick Add Custom Variable */}
            <div className="flex items-center gap-2 border-l border-slate-100 pl-4 ml-2">
              <input
                type="text"
                id="custom-var-input"
                placeholder="Add custom field..."
                className="w-28 h-7 text-[10px] bg-slate-50 border border-slate-100 rounded px-2 outline-none focus:border-orange-300 focus:bg-white transition-all font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    registerPlaceholder(e.currentTarget.value);
                    e.currentTarget.value = '';
                    toast.success('Variable added to list');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('custom-var-input');
                  if (input && input.value.trim()) {
                    registerPlaceholder(input.value);
                    input.value = '';
                    toast.success('Variable added to list');
                  }
                }}
                className="w-7 h-7 rounded-md bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 transition-all group"
                title="Register custom field"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col">
            <HtmlEmailEditor
              value={currentHtmlBody}
              onChange={setContent}
              userFields={[
                ...availableFields,
                { fieldName: 'sender_name', displayName: 'Sender Name' },
              ]}
              senderName={selectedSender?.name || ''}
            />

            <div className="px-6 py-4 border-t border-[#eaecf0] bg-white rounded-b-2xl">
              <div className="flex items-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setIsAiModalOpen(true)}
                  className="flex items-center gap-2.5 px-3 py-2 border-2 border-orange-100 bg-orange-50/50 rounded-md hover:bg-orange-100 transition-all group"
                >
                  <div className="w-5 h-5 rounded-full bg-orange-600 flex items-center justify-center group-hover:bg-orange-700 transition-colors shadow-sm shadow-orange-600/20">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[11px] font-bold text-orange-700">Compose with AI</span>
                </button>
              </div>

              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Type{' '}
                <code className="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-slate-500 font-mono">
                  %signature%
                </code>{' '}
                to insert your email account&apos;s signature where you want it added or it will be added
                at the end of the email by default
              </p>
            </div>

             {/* Deliverability Alert */}
            {missingVariables.length > 0 && (
              <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-start gap-4 mt-6 mb-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0 shadow-sm shadow-red-200/50">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-red-700 uppercase tracking-wider">
                      {t('campaigns.design.health_alert_title', 'Deliverability Alert: Missing Data')}
                    </h4>
                    <span className="text-[9px] font-black bg-red-100 text-red-700 px-2.5 py-1 rounded-md uppercase tracking-widest leading-none">
                      {t('campaigns.design.health_alert_action', 'Action Required')}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-red-600/70 leading-relaxed mb-3">
                    {t('campaigns.design.health_alert_desc', { vars: missingVariables.map(v => `{{${v}}}`).join(', ') })}
                  </p>
                  <div className="flex items-center gap-3 pt-1">
                    <button 
                      type="button"
                      className="px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 shadow-sm shadow-red-600/20 active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" /> {t('campaigns.design.enrich_apollo', 'Enrich with Apollo')}
                    </button>
                    <button 
                      type="button"
                      className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-50 transition-all active:scale-95"
                    >
                      {t('campaigns.design.update_leads', 'Update Lead List')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI GENERATION MODAL */}
      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} maxWidth="max-w-3xl">
        <div className="relative overflow-hidden bg-white/95 backdrop-blur-md rounded-[32px]">
          {/* Decorative Elements */}
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-orange-500 via-amber-500 to-orange-600" />

          <div className="p-10 md:p-14 space-y-10 relative z-10">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-orange-600 flex items-center justify-center shadow-xl shadow-orange-600/30 rotate-3 transform-gpu">
                  <Sparkles className="w-7 h-7 text-white animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter leading-none">
                    {t('campaigns.design.ai_modal_title', 'AI Sequence Architect')}
                  </h2>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    {t('campaigns.design.ai_modal_subtitle', 'Architect your entire multi-step campaign sequence in seconds.')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAiModalOpen(false)}
                className="w-12 h-12 rounded-2xl bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-all group active:scale-90"
              >
                <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-12 space-y-10">
                {/* Goal Field */}
                <div className="space-y-4">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
                    {t('campaigns.design.goal_label', "What's your campaign goal?")}
                  </label>
                  <textarea
                    className="w-full h-44 bg-slate-50/50 border-2 border-slate-100 rounded-[24px] p-8 text-base font-bold text-slate-700 focus:ring-12 focus:ring-orange-500/5 focus:border-orange-500/50 focus:bg-white outline-none transition-all resize-none placeholder:text-slate-300 placeholder:font-normal leading-relaxed shadow-inner"
                    placeholder={t('campaigns.design.goal_placeholder', "e.g. Schedule a demo for our new SEO tool. Target audience: SaaS Founders. Value Prop: We find 20% more broken links than competitors.")}
                    value={aiGoal}
                    onChange={(e) => setAiGoal(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Tone Selector */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
                      {t('campaigns.design.tone_label', 'Tone of Voice')}
                    </label>
                    <div className="relative group/select">
                      <select
                        className="w-full h-16 pl-6 pr-12 bg-slate-50/50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 hover:border-orange-200 focus:ring-12 focus:ring-orange-500/5 focus:border-orange-500/50 focus:bg-white outline-none transition-all appearance-none cursor-pointer"
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                      >
                        <option value="professional">{t('campaigns.design.tone_professional', 'Professional & Bold')}</option>
                        <option value="casual">{t('campaigns.design.tone_casual', 'Casual & Friendly')}</option>
                        <option value="urgent">{t('campaigns.design.tone_urgent', 'Urgent & Direct')}</option>
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-focus-within/select:text-orange-500 transition-colors" />
                    </div>
                  </div>

                  {/* Length Selector */}
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
                      {t('campaigns.design.sequence_length', 'Sequence Length')}
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setStepsCount(num)}
                          className={`h-16 rounded-2xl text-[13px] font-black transition-all flex flex-col items-center justify-center border-2 group relative overflow-hidden ${
                            stepsCount === num
                              ? 'bg-orange-600 border-orange-600 text-white shadow-xl shadow-orange-600/30 scale-105 z-10'
                              : 'bg-slate-50/50 border-slate-100 text-slate-400 hover:border-orange-200 hover:bg-white'
                          }`}
                        >
                          <span className="relative z-10">{num}</span>
                          <span className={`text-[7px] relative z-10 uppercase tracking-tighter ${stepsCount === num ? 'text-white/70' : 'text-slate-300'}`}>
                            {num === 1 ? 'Step' : 'Steps'}
                          </span>
                          {num === 3 && stepsCount !== num && (
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-orange-500" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* SMART TIPS SECTION */}
            <div className="p-10 bg-slate-50/50 border-2 border-slate-100 rounded-[24px] space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Tag className="w-4 h-4 text-orange-600" />
                </div>
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                  {t('campaigns.design.tips', 'Smart Personalization Tips')}
                </h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="space-y-5">
              <button
                onClick={handleAiGenerate}
                disabled={generateAi.isPending || !aiGoal.trim()}
                className="w-full h-20 bg-slate-900 text-white rounded-[24px] text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/40 hover:bg-slate-800 hover:translate-y-[-4px] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:translate-y-0 disabled:active:scale-100 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-linear-to-r from-orange-600/0 via-orange-600/10 to-orange-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {generateAi.isPending ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    <span className="animate-pulse">{t('campaigns.design.generating', 'Architecting Sequence...')}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6 text-orange-500 group-hover:rotate-12 transition-transform" />
                    {t('campaigns.design.generate_btn', 'Generate Sequence')}
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 justify-center text-[10px] font-black text-slate-400 tracking-widest bg-slate-50/50 py-3 rounded-xl border border-slate-100">
                <AlertCircle className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
                <span className="uppercase">{t('campaigns.design.warning_replace', 'Warning: This will replace your current sequence draft')}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Step1Design;
