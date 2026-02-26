import {
  Building,
  FileSpreadsheet,
  Globe,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
  Briefcase,
  Factory,
  Loader2,
  Zap,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import Modal from '../components/shared/modal';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

const ShowUpload = ({
  setShowUploadModal,
  uploadStep,
  resetUploadState,
  handleFileUpload,
  mapping,
  setMapping,
  fileHeaders,
  setUploadStep,
  handleContactsUpload,
  uploading,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);

  // Handle file upload locally to show preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ltr:ml-excel ltr:mr-excel rtl:ml-excel',
      '.xlsx',
      '.xls',
    ];

    if (!validTypes.some((type) => file.type.includes(type) || file.name.endsWith(type))) {
      toast.error(t('modals.upload.err_format'));
      return;
    }

    // Parse the file to show headers
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length > 0) {
          const headers = jsonData[0];

          // Update file headers and mapping
          handleFileUpload(file, headers);

          // Auto-map common headers
          const autoMapping = {};
          headers.forEach((header) => {
            const lowerHeader = header.toLowerCase();
            if (lowerHeader.includes('email')) autoMapping.email = header;
            if (
              lowerHeader.includes('name') &&
              !lowerHeader.includes('first') &&
              !lowerHeader.includes('last')
            )
              autoMapping.name = header;
            if (lowerHeader.includes('first')) autoMapping.firstName = header;
            if (lowerHeader.includes('last')) autoMapping.lastName = header;
            if (lowerHeader.includes('company')) autoMapping.company = header;
            if (lowerHeader.includes('phone')) autoMapping.phone = header;
            if (lowerHeader.includes('city')) autoMapping.city = header;
            if (lowerHeader.includes('country')) autoMapping.country = header;
            if (
              lowerHeader.includes('role') ||
              lowerHeader.includes('title') ||
              lowerHeader.includes('job')
            )
              autoMapping.role = header;
            if (lowerHeader.includes('industry') || lowerHeader.includes('sector'))
              autoMapping.industry = header;
          });

          setMapping((prev) => ({ ...prev, ...autoMapping }));
          setUploadStep(2);
        }
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        toast.error(t('modals.upload.err_read'));
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => {
        setShowUploadModal(false);
        resetUploadState();
      }}
      maxWidth="max-w-3xl"
      closeOnBackdrop={true}
    >
      <div className="bg-linear-to-br from-indigo-600 to-blue-700 p-8 relative overflow-hidden group">
        <div className="absolute top-0 ltr:right-0 rtl:left-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <FileSpreadsheet className="w-20 h-20 text-blue-400" />
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
              <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white uppercase tracking-tighter">
                {t('modals.upload.title')}
              </h3>
              <p className="text-[10px] font-bold text-indigo-100/60 uppercase tracking-widest mt-0.5">
                {t('modals.upload.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {uploadStep === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8 py-2"
            >
              <div className="text-center space-y-3">
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">
                  {t('modals.upload.select_file')}
                </h4>
                <p className="text-xs text-slate-400 font-medium">
                  {t('modals.upload.drop_desc')}
                </p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-slate-100 rounded-[2.5rem] p-12 hover:border-blue-400/50 hover:bg-blue-50/10 cursor-pointer transition-all duration-500"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-4xl flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-50 transition-all duration-500">
                    <Upload className="w-8 h-8 text-slate-300 group-hover:text-blue-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-extrabold text-slate-800 uppercase tracking-widest mb-1">
                      {t('modals.upload.btn_click')}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {t('modals.upload.drop_title')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                      .xlsx
                    </span>
                    <span className="px-3 py-1.5 bg-slate-50 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100">
                      .xls
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-tighter">
                    {t('modals.upload.mapping')}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {t('modals.upload.mapping_desc')}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">
                    {t('common.file_loaded')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.keys(mapping).map((field, index) => (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group p-5 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        {field === 'email' && <Mail className="w-4 h-4 text-rose-500" />}
                        {field === 'name' && <User className="w-4 h-4 text-emerald-500" />}
                        {field === 'firstName' && <User className="w-4 h-4 text-emerald-500" />}
                        {field === 'lastName' && <User className="w-4 h-4 text-emerald-500" />}
                        {field === 'company' && <Building className="w-4 h-4 text-indigo-500" />}
                        {field === 'phone' && <Phone className="w-4 h-4 text-blue-500" />}
                        {field === 'city' && <MapPin className="w-4 h-4 text-amber-500" />}
                        {field === 'country' && <Globe className="w-4 h-4 text-sky-500" />}
                        {field === 'role' && <Briefcase className="w-4 h-4 text-slate-500" />}
                        {field === 'industry' && <Factory className="w-4 h-4 text-orange-500" />}
                      </div>
                      <div>
                        <p className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight">
                          {field === 'email' ? t('common.email') : t(`modals.details.${field.replace(/([A-Z])/g, '_$1').toLowerCase()}`)}
                          {field === 'email' && <span className="text-rose-500 ltr:ml-1 ltr:mr-1 rtl:ml-1">*</span>}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {t('modals.upload.select_col')}
                        </p>
                      </div>
                    </div>
                    <select
                      value={mapping[field]}
                      onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                      className="w-full h-12 px-4 bg-white border-2 border-slate-100 rounded-2xl text-[11px] font-bold text-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none appearance-none cursor-pointer"
                    >
                      <option value="">{t('modals.upload.select_placeholder')}</option>
                      {fileHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-100">
                <button
                  onClick={() => setUploadStep(1)}
                  className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95"
                >
                  {t('common.back')}
                </button>
                <div className="flex items-center gap-4">
                  <button
                    onClick={resetUploadState}
                    className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all active:scale-95"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleContactsUpload}
                    disabled={!mapping.email || uploading}
                    className="px-10 py-4 bg-blue-600 rounded-2xl text-[10px] font-extrabold uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    {uploading ? t('modals.upload.uploading') : t('modals.upload.finish')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
};

export default ShowUpload;
