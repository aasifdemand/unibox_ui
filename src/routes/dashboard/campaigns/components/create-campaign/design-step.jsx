import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Plus, Clock, MessageSquare, Trash2, Mail } from 'lucide-react';
import HtmlEmailEditor from '../../../../../components/shared/html-editor';
import HighlightedInput from '../../../../../components/shared/highlighted-input';
import Modal from '../../../../../components/shared/modal';
import { useGenerateSequence } from '../../../../../hooks/useAi';
import { toast } from 'react-hot-toast';
import { Loader2, Sparkles } from 'lucide-react';

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
    key: 'job_title',
    label: t('campaigns.ph_job_title'),
    example: 'Marketing Manager',
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

const Step1Design = ({ register, errors, watch, setValue, selectedBatch, selectedSender }) => {
  const { t } = useTranslation();
  const [activeStepIndex, setActiveStepIndex] = useState(0); // 0 = Main, 1+ = Follow-ups
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [subjectTokenQuery, setSubjectTokenQuery] = useState('');
  const [subjectDropdownPos, setSubjectDropdownPos] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);

  const subjectInputRef = useRef(null);
  const highlightedInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // AI State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiTone, setAiTone] = useState('professional');
  const generateAi = useGenerateSequence();

  // Watchers
  const campaignName = watch('name');
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
    dynamicItems.forEach((item) => {
      if (!combined.find((c) => c.key === item.key)) {
        combined.push(item);
      }
    });

    return combined;
  }, [selectedBatch, t]);

  const availableFields = useMemo(() => {
    return allPlaceholders.map((p) => ({
      fieldName: p.key,
      displayName: p.label,
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
      const sequence = await generateAi.mutateAsync({ goal: aiGoal, tone: aiTone, stepsCount: 3 });

      if (sequence && sequence.length > 0) {
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

              <div className="h-4 w-[1px] bg-orange-100" />

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
                className="text-[13px] font-medium border-none !bg-transparent p-0 focus:ring-0 placeholder:text-slate-300 w-full"
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
                to insert your email account's signature where you want it added or it will be added
                at the end of the email by default
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI GENERATION MODAL */}
      <Modal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} maxWidth="max-w-3xl">
        <div className="relative overflow-hidden bg-white/80 ">
          {/* Decorative Gradient Background */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="p-10 md:p-14 space-y-8 relative z-10">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-600 flex items-center justify-center shadow-sm shadow-orange-600/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Smart Sequence AI
                </h2>
              </div>
              <p className="text-sm text-slate-400 font-medium">
                Describe your goal, and Gemini will architect your entire multi-step campaign
                sequence.
              </p>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
                  What's your campaign goal?
                </label>
                <textarea
                  className="w-full h-40 bg-slate-50/50 border-2 border-slate-100 rounded-[2rem] p-6 text-sm md:text-base font-medium focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/50 outline-none transition-all resize-none placeholder:text-slate-300 leading-relaxed"
                  placeholder="e.g. Schedule a demo for our new SEO tool. Target audience: SaaS Founders. Value Prop: We find 20% more broken links than competitors."
                  value={aiGoal}
                  onChange={(e) => setAiGoal(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
                    Tone of Voice
                  </label>
                  <select
                    className="w-full h-14 bg-slate-50/50 border-2 border-slate-100 rounded-lg px-5 text-sm font-bold text-slate-700 focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500/50 outline-none transition-all cursor-pointer appearance-none"
                    value={aiTone}
                    onChange={(e) => setAiTone(e.target.value)}
                  >
                    <option value="professional">Professional & Formal</option>
                    <option value="friendly">Friendly & Approachable</option>
                    <option value="bold">Bold & Direct</option>
                    <option value="concise">Short & Sweet</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1">
                    Architecture
                  </label>
                  <div className="h-14 bg-slate-50/50 border-2 border-slate-100 rounded-lg px-5 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">3-Step Sequence</span>
                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                      <Clock className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <button
                onClick={handleAiGenerate}
                disabled={generateAi.isPending}
                className="w-full h-16 bg-orange-600 rounded-lg text-white font-black text-base shadow-sm shadow-orange-600/30 hover:shadow-orange-600/50 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:translate-y-0"
              >
                {generateAi.isPending ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="animate-pulse">Architecting your sequence...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Magic Sequence
                  </>
                )}
              </button>

              <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-slate-400">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span>WARNING: THIS WILL REPLACE YOUR CURRENT DRAFT</span>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Step1Design;
