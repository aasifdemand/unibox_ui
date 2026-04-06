import React, { useState, useRef, useEffect } from 'react';
import { Filter as FunnelIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';

const FilterDropdown = ({ children, badgeCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { t } = useTranslation();

  // Close on Outside Click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-11 h-11 flex items-center justify-center rounded-md border transition-all active:scale-95 shadow-sm relative shrink-0 ${
          isOpen
            ? 'bg-purple-50 border-purple-200 text-purple-600'
            : 'bg-white border-slate-200 text-slate-700 hover:border-purple-200 hover:text-purple-600'
        }`}
        title={t('common.filters', 'Filters')}
      >
        <FunnelIcon className="w-4 h-4" />
        {badgeCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-purple-500 text-white min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
            {badgeCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute ltr:right-0 rtl:left-0 mt-2 w-72 sm:w-80 bg-white rounded-lg border border-slate-100 shadow-sm z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-700">
                {t('common.filters', 'Filters')}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FilterDropdown;
