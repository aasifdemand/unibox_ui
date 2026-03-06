import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, X, Search, Layout, Plus, ChevronRight, Loader2 } from 'lucide-react';
import Modal from '../components/shared/modal';

const TemplatePickerModal = ({ isOpen, onClose, templates, onSelect, isLoading }) => {
    const { t } = useTranslation();
    const [searchTerm, setSearchTerm] = React.useState('');

    const filteredTemplates = templates.filter(template =>
        template.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="max-w-4xl"
            title={t('templates.choose_template') || 'Choose Template'}
        >
            <div className="flex flex-col h-[70vh]">
                {/* Search Bar */}
                <div className="p-6 border-b border-slate-100 flex-none">
                    <div className="relative group">
                        <Search className="absolute ltr:left-4 ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder={t('templates.search_placeholder') || 'Search templates...'}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full h-12 ltr:pl-12 ltr:pr-6 rtl:pl-12 ltr:pr-6 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all outline-none"
                        />
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            <p className="text-sm font-bold uppercase tracking-widest">{t('common.loading')}</p>
                        </div>
                    ) : filteredTemplates.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                            <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-2">
                                <Layout className="w-8 h-8 text-slate-200" />
                            </div>
                            <p className="text-sm font-bold uppercase tracking-widest">
                                {searchTerm ? t('templates.no_results') : t('templates.no_templates')}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {filteredTemplates.map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => onSelect(template)}
                                    className="group flex flex-col text-left p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-sm relative overflow-hidden"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                    </div>

                                    <h4 className="font-black text-slate-800 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                                        {template.name}
                                    </h4>
                                    <p className="text-xs font-bold text-slate-400 line-clamp-2 leading-relaxed italic">
                                        {template.subject || t('templates.no_subject')}
                                    </p>

                                    <div className="absolute top-0 right-0 p-2">
                                        {template.status === 'active' && (
                                            <span className="bg-emerald-50 text-emerald-600 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter border border-emerald-100">
                                                {t('common.status.active') || 'Active'}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 flex-none bg-slate-50/50 flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {filteredTemplates.length} {t('templates.templates_found') || 'Templates Found'}
                    </p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default TemplatePickerModal;
