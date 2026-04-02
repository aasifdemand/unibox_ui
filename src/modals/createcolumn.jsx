import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, LayoutDashboard, Palette, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAddCrmStage, useReplyCategories } from '../hooks/useCrm';
import Modal from '../components/shared/modal';

const CreateColumn = ({ open, setOpen, onCreated }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#f97316');
  const [replyCategory, setReplyCategory] = useState('');
  
  const { data: categories = [] } = useReplyCategories();
  const addStageMutation = useAddCrmStage();
  const colorInputRef = React.useRef(null);

  const handleClose = () => {
    setOpen(false);
    setName('');
    setReplyCategory('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter a column name');
    
    try {
      await addStageMutation.mutateAsync({
        name: name,
        color: color,
        replyCategory: replyCategory || null,
      });
      toast.success('Column added to your funnel');
      if (onCreated) onCreated();
      handleClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={handleClose}
      maxWidth="max-w-lg"
    >
      <input
        type="color"
        ref={colorInputRef}
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="sr-only"
      />
      
      {/* BRANDED ORANGE HEADER - COMPACT PREMIUM */}
      <div className="bg-linear-to-br from-orange-600 to-orange-700 p-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
          <LayoutDashboard className="w-20 h-20 text-white" />
        </div>
        <div className="relative flex items-center gap-4 pr-16">
          <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white uppercase tracking-tighter leading-none">
              {t('crm.add_column_modal_title', 'Add New Column')}
            </h3>
            <p className="text-[9px] font-bold text-orange-100/60 uppercase tracking-widest mt-1.5">
              Pipeline Configuration
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5">
            {/* Column Name */}
            <div className="space-y-2">
              <div className="px-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {t('crm.column_name_label', 'Column Name')}
                </label>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">
                  NAME AND COLOR WILL HELP VISUALLY IDENTIFY THIS STAGE IN YOUR PIPELINE.
                </p>
              </div>
              
              <div className="relative flex items-center group z-30">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('crm.column_name_placeholder', 'e.g., Qualified Leads')}
                  className="w-full h-11 pl-5 pr-14 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:border-orange-500/50 focus:bg-white transition-all outline-none"
                  autoFocus
                />
                
                <div className="absolute right-1.5 top-1/2 -translate-y-1/2 group/picker">
                  <button
                    type="button"
                    onClick={() => colorInputRef.current?.click()}
                    className="w-8 h-8 rounded-md border border-slate-100 flex items-center justify-center shadow-sm transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: color }}
                  >
                    <Palette
                      className={`w-3.5 h-3.5 ${
                        ['#ffffff', '#f8fafc', '#f1f5f9'].includes(color.toLowerCase()) 
                          ? 'text-slate-300' 
                          : 'text-white drop-shadow-sm'
                      }`}
                    />
                  </button>
                  
                  {/* Floating Selection - Appears BELOW to avoid close button conflict */}
                  <div className="absolute top-full right-0 mt-4 p-4 bg-white border border-slate-100 rounded-xl shadow-2xl hidden group-hover/picker:flex flex-col gap-3 z-110 animate-in fade-in slide-in-from-top-2 duration-200 min-w-[140px]">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest text-center whitespace-nowrap">
                       Custom Color
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        '#f97316', '#8b5cf6', '#10b981', '#64748b',
                        '#06b6d4', '#ef4444', '#3b82f6', '#f59e0b'
                      ].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setColor(c)}
                          className={`w-6 h-6 rounded-md transition-transform hover:scale-110 active:scale-90 ring-2 ring-white ${color === c ? 'ring-offset-1 ring-orange-500 scale-110' : ''}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => colorInputRef.current?.click()}
                      className="h-8 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all active:scale-95"
                    >
                      <Palette className="w-3 h-3" />
                      <span>Spectrum</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Intent Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  {t('crm.link_intent_label', 'Link to AI Intent')} <span className="text-slate-300 ml-1 text-[8px]">(Optional)</span>
                </label>
              </div>
              <div className="relative group/select">
                <select
                  value={replyCategory}
                  onChange={(e) => setReplyCategory(e.target.value)}
                  className="w-full h-11 pl-5 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-orange-500/50 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="">{t('crm.select_intent_placeholder', 'Select an intent...')}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none group-focus-within/select:text-orange-500 transition-colors">
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
              <p className="text-[9px] font-bold text-slate-400 px-1 leading-relaxed">
                Leads will be auto-moved to this stage when matching replies are detected.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-11 bg-white border border-slate-200 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all active:scale-95"
            >
              {t('common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={addStageMutation.isPending || !name.trim()}
              className="flex-1 h-11 bg-orange-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/10 hover:bg-orange-500 hover:-translate-y-px transition-all active:scale-95 disabled:opacity-50"
            >
              {addStageMutation.isPending ? 'Progressing...' : t('crm.add_column_btn', 'Add Column')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateColumn;
