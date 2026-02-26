import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Layout, Loader2, Database, Tag, User, X } from 'lucide-react';
import Input from '../../../../../components/ui/input';
import HtmlEmailEditor from '../../../../../components/shared/html-editor';
import { useTemplates } from '../../../../../hooks/useTemplate';
import { Link } from 'react-router-dom';
import Button from '../../../../../components/ui/button';

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
  editorMode,
  setEditorMode,
  selectedBatch,
  selectedSender, // Add this prop
}) => {
  const { t } = useTranslation();
  const [showSubjectSuggestions, setShowSubjectSuggestions] = useState(false);
  const [subjectInputValue, setSubjectInputValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  const subjectInputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const { data: templates = [], isLoading: templatesLoading } = useTemplates();

  const subjectValue = watch('subject') || '';
  const htmlBody = watch('htmlBody') || '';
  const campaignName = watch('name');

  // Update content when sender changes
  useEffect(() => {
    if (selectedSender?.displayName && htmlBody) {
      // Replace {{sender_name}} with actual sender name
      const updatedBody = htmlBody.replace(/\{\{sender_name\}\}/g, selectedSender.displayName);

      // Only update if there was a change
      if (updatedBody !== htmlBody) {
        setValue('htmlBody', updatedBody, { shouldValidate: true });
      }
    }
  }, [selectedSender, htmlBody, setValue]);

  // Dynamic Placeholders Logic
  const availableColumns = useMemo(() => {
    if (!selectedBatch) return [];
    const meta = selectedBatch.mapping || {};
    const columns = Object.values(meta).filter((v) => v && v !== '');
    if (columns.length === 0) {
      return [
        'email',
        'name',
        'first_name',
        'last_name',
        'company',
        'role',
        'industry',
        'city',
        'country',
        'phone',
      ];
    }
    return [...new Set(columns)];
  }, [selectedBatch]);

  // Add sender_name to available columns
  const allPlaceholders = useMemo(() => {
    const placeholders = getPlaceholders(t);

    // Add dynamic columns from batch
    const dynamicItems = availableColumns.map((col) => {
      const lowerCol = col.toLowerCase().replace(/\s+/g, '_');
      const existing = placeholders.find((s) => s.key === lowerCol);
      if (existing) return existing;
      return {
        key: lowerCol,
        label: col,
        example: `[${col}]`,
        category: t('campaigns.cat_custom'),
      };
    });

    return [...placeholders, ...dynamicItems];
  }, [availableColumns]);

  const filteredSuggestions = useMemo(() => {
    return allPlaceholders.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
  }, [allPlaceholders]);

  useEffect(() => {
    setSubjectInputValue(subjectValue);
  }, [subjectValue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        subjectInputRef.current &&
        !subjectInputRef.current.contains(event.target)
      ) {
        setShowSubjectSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applyTemplate = (template) => {
    if (template.name && !campaignName) {
      setValue('name', `${template.name} Campaign`, { shouldValidate: true });
    }
    if (template.subject) {
      setValue('subject', template.subject, { shouldValidate: true });
    }
    const content =
      template.htmlContent || template.htmlBody || template.content || template.html || '';
    setValue('htmlBody', content, { shouldValidate: true });
  };

  const handleSubjectChange = (e) => {
    const value = e.target.value;
    setSubjectInputValue(value);
    setValue('subject', value, { shouldValidate: true });
    if (value.slice(-2) === '{{') setShowSubjectSuggestions(true);
  };

  const insertPlaceholder = (placeholderKey) => {
    const textBeforeCursor = subjectInputValue.slice(0, cursorPosition);
    const textAfterCursor = subjectInputValue.slice(cursorPosition);
    const lastTwoChars = textBeforeCursor.slice(-2);
    let newValue =
      lastTwoChars === '{{'
        ? textBeforeCursor.slice(0, -2) + `{{${placeholderKey}}}` + textAfterCursor
        : textBeforeCursor + `{{${placeholderKey}}}` + textAfterCursor;

    setSubjectInputValue(newValue);
    setValue('subject', newValue, { shouldValidate: true });
    setShowSubjectSuggestions(false);

    setTimeout(() => {
      if (subjectInputRef.current) {
        const newCursorPos =
          textBeforeCursor.length +
          `{{${placeholderKey}}}`.length -
          (lastTwoChars === '{{' ? 2 : 0);
        subjectInputRef.current.focus();
        subjectInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  return (
    <div
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') e.preventDefault();
      }}
    >
      {/* Premium Template Selection */}
      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Layout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tighter">
                {t('campaigns.start_with_template')}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                {t('campaigns.choose_library')}
              </p>
            </div>
          </div>
          <Link
            to="/dashboard/templates"
            className="px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all border-2 border-slate-50 hover:border-blue-100 hover:bg-blue-50/50"
          >
            {t('campaigns.library')}
          </Link>
        </div>

        <div className="p-8">
          {templatesLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500/20" />
              <p className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest">
                {t('campaigns.loading')}
              </p>
            </div>
          ) : templates.length > 0 ? (
            <div className="flex items-center gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {templates.slice(0, 8).map((template) => (
                <div
                  key={template.id}
                  onClick={() => applyTemplate(template)}
                  className="shrink-0 w-60 group cursor-pointer"
                >
                  <div className="bg-white rounded-3xl border-2 border-slate-100 p-4 hover:border-blue-400/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                    <div className="h-20 bg-slate-50 rounded-xl mb-3 p-3 overflow-hidden relative">
                      <p className="text-[8px] text-slate-400 leading-tight">
                        {(template.htmlContent || template.htmlBody || '')
                          .replace(/<[^>]*>/g, '')
                          .substring(0, 60)}
                        ...
                      </p>
                      <div className="absolute inset-0 bg-linear-to-t from-slate-50 to-transparent"></div>
                    </div>
                    <h5 className="font-extrabold text-slate-800 text-[11px] uppercase tracking-tight truncate group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h5>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate mt-1">
                      {template.subject || 'No Subject'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-4 italic">
                {t('campaigns.no_templates')}
              </p>
              <Link to="/dashboard/templates/create">
                <Button className="rounded-2xl px-8">{t('campaigns.create_one')}</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Input
            label={t('campaigns.campaign_name')}
            placeholder={t('campaigns.campaign_name_placeholder')}
            {...register('name')}
            error={errors.name?.message}
            required
            className="rounded-2xl border-2 border-slate-100 focus:border-blue-500"
          />

          <div className="relative group">
            <div className="flex items-center justify-between mb-2 px-1">
              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                {t('campaigns.subject_line')} *
              </label>
              <button
                type="button"
                onClick={() => setShowSubjectSuggestions(!showSubjectSuggestions)}
                className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 flex items-center gap-1.5"
              >
                <Tag className="w-3 h-3" /> {t('campaigns.insert_variable')}
              </button>
            </div>
            <div className="relative">
              <input
                ref={subjectInputRef}
                type="text"
                value={subjectInputValue}
                onChange={handleSubjectChange}
                onKeyDown={(e) => {
                  setCursorPosition(e.target.selectionStart);
                  if (e.key === 'Enter') e.preventDefault();
                }}
                onKeyUp={(e) => setCursorPosition(e.target.selectionStart)}
                className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold transition-all outline-none ${errors.subject
                  ? 'border-rose-100 text-rose-600'
                  : 'border-slate-100 text-slate-700 focus:bg-white focus:border-blue-500'
                  }`}
                placeholder="e.g., Hi {{first_name}}!"
              />
              {showSubjectSuggestions && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 mt-3 w-full bg-white rounded-4xl shadow-2xl border border-slate-200/60 p-4 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                      {t('campaigns.variables')}
                    </span>
                    <button
                      onClick={() => setShowSubjectSuggestions(false)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="max-h-52 overflow-y-auto no-scrollbar">
                    {Object.entries(filteredSuggestions).map(([cat, items]) => (
                      <div key={cat} className="mb-2">
                        <div className="text-[8px] font-extrabold text-slate-300 uppercase tracking-[0.2em] px-3 py-1.5">
                          {cat}
                        </div>
                        {items.map((item) => (
                          <button
                            key={item.key}
                            onClick={() => insertPlaceholder(item.key)}
                            className="w-full ltr:text-left ltr:text-right rtl:text-left px-3 py-2 hover:bg-slate-50 rounded-xl flex items-center justify-between group/item transition-all"
                          >
                            <span className="font-mono text-[10px] text-blue-600 font-bold">
                              {'{{'}
                              {item.key}
                              {'}}'}
                            </span>
                            <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                              {item.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Variables Info Panel */}
        {selectedBatch && (
          <div className="bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-6 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-[11px] font-extrabold text-slate-800 uppercase tracking-widest">
                  {t('campaigns.personalization')}
                </h4>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                  {t('campaigns.avail_variables')}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableColumns.map((col) => (
                <div
                  key={col}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 group cursor-default hover:border-blue-300 transition-all shadow-sm"
                >
                  <div className="w-1 h-1 rounded-full bg-blue-400"></div>
                  <code className="text-[9px] font-extrabold text-slate-600 font-mono">
                    {'{{'}
                    {col.toLowerCase().replace(/\s+/g, '_')}
                    {'}}'}
                  </code>
                </div>
              ))}
              <div className="px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-xl flex items-center gap-2 shadow-sm">
                <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                <code className="text-[9px] font-extrabold text-purple-600 font-mono">
                  {'{{'}sender_name{'}}'}
                </code>
              </div>
              <div className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 shadow-sm">
                <div className="w-1 h-1 rounded-full bg-rose-400"></div>
                <code className="text-[9px] font-extrabold text-rose-600 font-mono">
                  {'{{'}unsubscribe_link{'}}'}
                </code>
              </div>
            </div>

            {selectedSender && (
              <div className="mt-4 p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                  <User className="w-3 h-3 text-green-600" />
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                    {t('campaigns.active_sender')}
                  </p>
                  <p className="text-xs font-bold text-slate-800">{selectedSender.displayName}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-tighter">
                {t('campaigns.message_content')}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t('campaigns.design_sequence')}
              </p>
            </div>
          </div>

          <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/50">
            {['html', 'text'].map((mode) => (
              <button
                key={mode}
                onClick={() => setEditorMode(mode)}
                className={`px-5 py-1.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest transition-all ${editorMode === mode
                  ? 'bg-white text-blue-600 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {mode === 'html' ? t('campaigns.canvas_mode') : t('campaigns.raw_text_mode')}
              </button>
            ))}
          </div>
        </div>

        <div className="border-2 border-slate-100 rounded-[2.5rem] bg-white overflow-hidden shadow-sm shadow-slate-200/20">
          {editorMode === 'html' ? (
            <HtmlEmailEditor
              value={htmlBody}
              onChange={(html) => setValue('htmlBody', html, { shouldValidate: true })}
              userFields={[
                ...availableColumns.map((col) => ({
                  fieldName: col.toLowerCase().replace(/\s+/g, '_'),
                  displayName: col,
                })),
                { fieldName: 'sender_name', displayName: t('campaigns.ph_sender_name') },
              ]}
            />
          ) : (
            <textarea
              {...register('htmlBody')}
              rows={15}
              className="w-full p-8 bg-slate-900 text-slate-300 font-mono text-sm border-0 focus:ring-0 resize-none outline-none"
              placeholder={t('campaigns.body_placeholder')}
            />
          )}
        </div>
        {errors.htmlBody && (
          <p className="text-xs font-bold text-rose-500 uppercase tracking-widest ltr:ml-4 ltr:mr-4 rtl:ml-4">
            {errors.htmlBody.message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Step1Design;
