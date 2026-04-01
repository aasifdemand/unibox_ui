/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tag, Plus, Clock, MessageSquare, Trash2, Mail, Sparkles, AlertCircle, Zap } from 'lucide-react';
import HtmlEmailEditor from '../../../../../components/shared/html-editor';
import HighlightedInput from '../../../../../components/shared/highlighted-input';
import AiSequenceArchitectModal from '../../../../../modals/AiSequenceArchitectModal';
import { useStreamSequence } from '../../../../../hooks/useAi';
import { toast } from 'react-hot-toast';
import Input from '../../../../../components/ui/input';
import Button from '../../../../../components/ui/button';
import { apiClient } from '../../../../../lib/api';


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
  const [isStreaming, setIsStreaming] = useState(false);
  const streamAi = useStreamSequence();

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

  const onSendTest = async () => {
    const testEmail = window.prompt("Enter recipient email for test:", "");
    if (!testEmail) return;

    const sId = selectedSender?.id || watch('senderId');
    const sType = selectedSender?.type || watch('senderType');

    if (!sId) {
      toast.error("Please select a sender in the Setup step first.");
      return;
    }

    try {
      
      toast.promise(
        apiClient.post('/campaigns/test-send-stateless', {
          testEmail,
          subject: currentSubject,
          htmlBody: currentHtmlBody,
          senderId: sId,
          senderType: sType
        }),
        {
          loading: 'Sending test...',
          success: 'Test email sent!',
          error: 'Failed to send test.'
        }
      );
    } catch (err) {
      console.error("Test send error:", err);
      toast.error("An error occurred during test send.");
    }
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

    setIsStreaming(true);
    setIsAiModalOpen(false); // Close modal immediately to show the editor
    setActiveStepIndex(0); // Ensure we are looking at the first step

    try {
      const variables = allPlaceholders.map((p) => p.key);
      let finalContent = '';

      // Multi-stage JSON and email object extraction
      const extractJsonRobust = (text) => {
        if (!text) return null;
        try {
          return JSON.parse(text);
        } catch {
          // Try to find JSON block in markdown
          const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (markdownMatch) {
            try { 
              return JSON.parse(markdownMatch[1]); 
            } catch (err) {
              console.debug("Failed parsing nested markdown JSON:", err.message);
            }
          }
          // Try to find anything between [ ] or { }
          const bracketMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
          if (bracketMatch) {
            try { 
              return JSON.parse(bracketMatch[0]); 
            } catch (err) {
              console.debug("Failed parsing bracketed JSON content:", err.message);
            }
          }
          return null;
        }
      };

      const extractEmails = (text) => {
        const emails = [];
        // More resilient regex for subject/body objects
        const emailMatches = text.matchAll(/\{\s*["']subject["']\s*:\s*["']([^"']*)["']?(?:,\s*["']body["']\s*:\s*["']([^"']*)["']?)?/gi);
        
        for (const match of emailMatches) {
          const subject = (match[1] || '').replace(/\\n/g, ' ');
          let body = (match[2] || '');
          body = body.replace(/\\n/g, '<br />').replace(/\\"/g, '"');
          emails.push({ subject, body });
        }
        return emails;
      };

      await streamAi(
        { goal: aiGoal, tone: aiTone, stepsCount, variables },
        (chunk) => {
          finalContent = chunk;

          // Update main editor and steps in real-time
          const discoveredEmails = extractEmails(chunk);
          if (discoveredEmails.length > 0) {
            // Update the first email directly
            if (discoveredEmails[0].subject) {
              setValue('subject', discoveredEmails[0].subject, { shouldValidate: true });
            }
            if (discoveredEmails[0].body) {
              setValue('htmlBody', discoveredEmails[0].body, { shouldValidate: true });
            }

            // Update follow-up steps if any discovered
            if (discoveredEmails.length > 1) {
              const followUps = discoveredEmails.slice(1).map((em, i) => ({
                stepOrder: i + 1,
                subject: em.subject || `Follow-up ${i + 1}`,
                htmlBody: em.body || '',
                textBody: '',
                delayMinutes: 4320 * (i + 1),
                condition: 'no_reply',
              }));
              setValue('steps', followUps, { shouldValidate: true });
            }
          }
        },
        () => {
          // On End - finalize everything precisely
          try {
            let sequence = extractJsonRobust(finalContent);
            
            if (!sequence || sequence.length === 0) {
               console.warn("Standard JSON extraction failed, falling back to discovered emails");
               sequence = extractEmails(finalContent);
            }
            
            if (sequence && !Array.isArray(sequence)) {
               sequence = sequence.steps || sequence.emails || sequence.sequence || [sequence];
            }

            if (sequence.length > 0) {
              setValue('subject', sequence[0].subject, { shouldValidate: true });
              setValue('htmlBody', (sequence[0].body || '').replace(/\n/g, '<br />'), { shouldValidate: true });

              const followUps = sequence.slice(1).map((s, i) => ({
                stepOrder: i + 1,
                subject: s.subject || `Follow-up ${i + 1}`,
                htmlBody: (s.body || '').replace(/\n/g, '<br />'),
                textBody: '',
                delayMinutes: 4320 * (i + 1),
                condition: 'no_reply',
              }));

              setValue('steps', followUps, { shouldValidate: true });
              toast.success('Campaign sequence architected successfully!');
            } else {
              throw new Error("No emails found in sequence.");
            }
          } catch (e) {
            console.error('Failed to parse final AI output:', e);
            toast.error('Generation complete, but could not parse the format.');
          } finally {
            setIsStreaming(false);
          }
        },
        (err) => {
          console.error('AI Stream Failed:', err);
          toast.error('Failed to generate sequence. Please try again.');
          setIsStreaming(false);
        }
      );
    } catch (error) {
      console.error('AI Generation Failed:', error);
      toast.error('Failed to generate sequence. Please try again.');
      setIsStreaming(false);
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">Inbox Preview</h3>
              <div className="w-3.5 h-3.5 rounded-full border border-slate-300 flex items-center justify-center text-[8px] text-slate-400 cursor-help font-black">
                i
              </div>
            </div>
            
            <button
              type="button"
              onClick={onSendTest}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-[10px] font-black text-orange-600 uppercase tracking-widest hover:border-orange-400 hover:bg-orange-50 transition-all shadow-sm"
            >
              <Zap className="w-3 h-3 fill-orange-600" />
              Send Test
            </button>
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
            {isStreaming && (
              <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 border border-orange-100 rounded-full animate-pulse shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
                <span className="text-[9px] font-black text-orange-600 uppercase tracking-widest">AI Architecting...</span>
              </div>
            )}
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
                    className="w-16 h-10 bg-white border border-slate-200 rounded-xl text-center text-[11px] font-black text-orange-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none"
                  />
                  <span className="ml-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
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
                  className="h-10 bg-white border border-slate-200 rounded-xl px-4 text-[10px] font-black text-orange-600 uppercase tracking-widest focus:border-orange-500 focus:ring-4 focus:ring-orange-500/5 transition-all outline-none cursor-pointer appearance-none pr-8"
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
              <div className="w-56 flex items-center gap-2">
                <Input
                  id="custom-var-input"
                  placeholder="Add custom field..."
                  className="h-10 text-[10px] font-bold uppercase tracking-widest text-slate-700 placeholder:text-slate-300"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      registerPlaceholder(e.currentTarget.value);
                      e.currentTarget.value = '';
                      toast.success('Variable added to list');
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    const input = document.getElementById('custom-var-input');
                    if (input && input.value.trim()) {
                      registerPlaceholder(input.value);
                      input.value = '';
                      toast.success('Variable added to list');
                    }
                  }}
                  className="h-10 w-10 p-0 shrink-0 border-slate-200"
                  title="Register custom field"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
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
      <AiSequenceArchitectModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        aiGoal={aiGoal}
        setAiGoal={setAiGoal}
        aiTone={aiTone}
        setAiTone={setAiTone}
        stepsCount={stepsCount}
        setStepsCount={setStepsCount}
        handleAiGenerate={handleAiGenerate}
        isStreaming={isStreaming}
      />
    </div>
  );
};

export default Step1Design;
