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
          const headers = jsonData[0].filter(Boolean); // remove empty header cells

          // Build mapping dynamically from ALL headers so every column gets a card
          const autoMapping = {};
          headers.forEach((header) => {
            if (!header) return;
            const lowerHeader = String(header).toLowerCase().replace(/[^a-z]/g, '');
            if (lowerHeader === 'email' || lowerHeader.includes('email')) {
              autoMapping.email = autoMapping.email || header;
            } else if (lowerHeader === 'firstname' || lowerHeader === 'first') {
              autoMapping.firstName = header;
            } else if (lowerHeader === 'lastname' || lowerHeader === 'last') {
              autoMapping.lastName = header;
            } else if (lowerHeader === 'name' || lowerHeader === 'fullname') {
              autoMapping.name = header;
            } else if (lowerHeader === 'company') {
              autoMapping.company = header;
            } else if (lowerHeader === 'phone') {
              autoMapping.phone = header;
            } else if (lowerHeader === 'city') {
              autoMapping.city = header;
            } else if (lowerHeader === 'country') {
              autoMapping.country = header;
            } else if (lowerHeader === 'role' || lowerHeader === 'title' || lowerHeader === 'jobtitle') {
              autoMapping.role = header;
            } else if (lowerHeader === 'industry' || lowerHeader === 'sector') {
              autoMapping.industry = header;
            } else {
              // All other columns: use the original header as the key so nothing is lost
              autoMapping[header] = header;
            }
          });

          setMapping(autoMapping);
          handleFileUpload(file, headers);
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
      <div className="bg-linear-to-br from-purple-600 to-purple-700 p-8 relative overflow-hidden group">
        <div className="absolute top-0 ltr:right-0 rtl:left-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <FileSpreadsheet className="w-20 h-20 text-purple-400" />
        </div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center border border-purple-500/30">
              <FileSpreadsheet className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">
                {t('modals.upload.title')}
              </h3>
              <p className="text-sm font-semibold text-white/70 mt-1">
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
              <div className="text-center space-y-2">
                <h4 className="text-lg font-semibold text-slate-800">
                  {t('modals.upload.select_file')}
                </h4>
                <p className="text-sm text-slate-500 font-medium">{t('modals.upload.drop_desc')}</p>
              </div>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="group relative border-2 border-dashed border-slate-100 rounded-lg p-12 hover:border-purple-400/50 hover:bg-purple-50/10 cursor-pointer transition-all duration-500"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-lg flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-50 transition-all duration-500">
                    <Upload className="w-8 h-8 text-slate-300 group-hover:text-purple-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-purple-600 mb-1 pointer-events-none group-hover:underline">
                      {t('modals.upload.btn_click')}
                    </p>
                    <p className="text-xs text-slate-500 font-medium pointer-events-none">
                      {t('modals.upload.drop_title')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-slate-50 rounded-md text-xs font-semibold text-slate-400 border border-slate-100">
                      .xlsx
                    </span>
                    <span className="px-3 py-1 bg-slate-50 rounded-md text-xs font-semibold text-slate-400 border border-slate-100">
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
                  <h4 className="text-lg font-semibold text-slate-800">
                    {t('modals.upload.mapping')}
                  </h4>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    {t('modals.upload.mapping_desc')}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-purple-700">
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
                    className="group p-5 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-white transition-all duration-300"
                  >
                    <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                        {field === 'email' && <Mail className="w-4 h-4 text-purple-500" />}
                        {field === 'name' && <User className="w-4 h-4 text-purple-500" />}
                        {field === 'firstName' && <User className="w-4 h-4 text-purple-500" />}
                        {field === 'lastName' && <User className="w-4 h-4 text-purple-500" />}
                        {field === 'company' && <Building className="w-4 h-4 text-purple-500" />}
                        {field === 'phone' && <Phone className="w-4 h-4 text-purple-500" />}
                        {field === 'city' && <MapPin className="w-4 h-4 text-amber-500" />}
                        {field === 'country' && <Globe className="w-4 h-4 text-purple-500" />}
                        {field === 'role' && <Briefcase className="w-4 h-4 text-slate-500" />}
                        {field === 'industry' && <Factory className="w-4 h-4 text-purple-500" />}
                        {!['email','name','firstName','lastName','company','phone','city','country','role','industry'].includes(field) && (
                          <Zap className="w-4 h-4 text-purple-400" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-semibold text-slate-800">
                          {/* For known fields use i18n; for custom fields convert to Title Case */}
                          {['email','name','firstName','lastName','company','phone','city','country','role','industry'].includes(field)
                            ? (field === 'email' ? t('common.email') : field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()))
                            : field.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                          }
                          {field === 'email' && (
                            <span className="text-purple-500 ltr:ml-1 ltr:mr-1 rtl:ml-1">*</span>
                          )}
                        </p>
                        <p className="text-xs font-medium text-slate-500">
                          {t('modals.upload.select_col')}
                        </p>
                      </div>
                    </div>
                    <select
                      value={mapping[field]}
                      onChange={(e) => setMapping({ ...mapping, [field]: e.target.value })}
                      className="w-full h-12 px-3 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:border-purple-500 transition-all outline-none appearance-none cursor-pointer hover:border-slate-300"
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

              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
                <button
                  onClick={() => setUploadStep(1)}
                  className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                >
                  {t('common.back')}
                </button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={resetUploadState}
                    className="px-6 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    onClick={handleContactsUpload}
                    disabled={!mapping.email || uploading}
                    className="px-8 py-2.5 bg-purple-600 rounded-lg text-sm font-semibold text-white shadow-sm hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
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
