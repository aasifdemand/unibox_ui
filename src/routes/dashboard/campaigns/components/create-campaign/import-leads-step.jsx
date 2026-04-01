import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  Users,
  Upload,
  Database,
  Search,
  Check,
  FileSpreadsheet,
  Loader2,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import ShowUpload from '../../../../../modals/showupload';
import { useUploadBatch } from '../../../../../hooks/useBatches';

const ImportLeadsStep = ({
  
  handleBatchSelect,
  watchListBatchId,
  verifiedBatches = [],
  isLoadingBatches,
  refetchBatches,
}) => {
  const { t } = useTranslation();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadStep, setUploadStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileHeaders, setFileHeaders] = useState([]);
  const [mapping, setMapping] = useState({
    email: '',
    name: '',
    firstName: '',
    lastName: '',
    company: '',
  });

  const uploadBatch = useUploadBatch();

  const handleFileUploadWrapper = (file, headers) => {
    setUploadedFile(file);
    setFileHeaders(headers);
    setUploadStep(2);

    const autoMapping = {};
    headers.forEach((header) => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes('email')) autoMapping.email = header;
      if (lowerHeader.includes('first')) autoMapping.firstName = header;
      if (lowerHeader.includes('last')) autoMapping.lastName = header;
      if (lowerHeader.includes('name') && !autoMapping.firstName) autoMapping.name = header;
      if (lowerHeader.includes('company')) autoMapping.company = header;
    });
    setMapping((prev) => ({ ...prev, ...autoMapping }));
  };

  const handleContactsUpload = async () => {
    if (!uploadedFile || !mapping.email) {
      toast.error(t('campaigns.err_map_email'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('mapping', JSON.stringify(mapping));
      const result = await uploadBatch.mutateAsync(formData);
      setShowUploadModal(false);
      if (refetchBatches) refetchBatches();
      if (result.data?.batchId) {
        handleBatchSelect(result.data.batchId);
      }
      toast.success(t('campaigns.msg_upload_success'));
    } catch (error) {
      toast.error(error.message || t('campaigns.msg_upload_failed'));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pt-8 pb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Minimal Header */}
      <div className="text-center space-y-3">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Add Leads to Campaign</h2>
        <p className="text-base font-medium text-slate-400 max-w-md mx-auto">
          Choose how you&apos;d like to import your prospects for this sequence
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Upload Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shadow-sm">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                New Audience
              </h3>
            </div>
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
              CSV / XLS supported
            </span>
          </div>

          <div
            onClick={() => setShowUploadModal(true)}
            className="group relative border-2 border-dashed border-slate-200 hover:border-orange-400 bg-white hover:bg-slate-50/50 rounded-lg p-16 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer shadow-sm hover:shadow-sm hover:shadow-orange-600/5 hover:-translate-y-1"
          >
            <div className="w-20 h-20 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner mb-6">
              <FileSpreadsheet className="w-9 h-9" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-bold text-slate-800">
                Click to{' '}
                <span className="text-orange-600 group-hover:underline underline-offset-4">
                  browse
                </span>{' '}
                or drag and drop
              </p>
              <p className="text-sm font-medium text-slate-400">
                Import a new spreadsheet and we&apos;ll automatically map the fields for you.
              </p>
            </div>
            <div className="absolute bottom-6 right-8 flex items-center gap-2 text-orange-600 font-bold text-xs opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
              Start Upload <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="relative flex items-center py-2">
          <div className="grow border-t-2 border-slate-100"></div>
          <span className="shrink-0 mx-6 text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100/50">
            OR SELECT FROM
          </span>
          <div className="grow border-t-2 border-slate-100"></div>
        </div>

        {/* Saved Lists Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                Saved Audiences
              </h3>
            </div>
            <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline underline-offset-4">
              Manage Lists
            </button>
          </div>

          <div className="bg-white border-2 border-slate-100 rounded-lg p-10 shadow-sm space-y-10 hover:border-orange-100 transition-colors">
            <div className="relative group">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-orange-600 transition-colors" />
              </div>
              <select
                className="w-full pl-14 pr-12 h-12 bg-slate-50/50 border-2 border-slate-100 hover:border-slate-200 rounded-lg text-sm font-bold text-slate-700 focus:border-orange-600 focus:ring-4 focus:ring-orange-600/5 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                value={watchListBatchId || ''}
                onChange={(e) => handleBatchSelect(e.target.value)}
              >
                <option value="" className="text-slate-400 font-medium">
                  Search your contact lists...
                </option>
                {verifiedBatches.map((batch) => (
                  <option key={batch.id} value={batch.id} className="text-slate-900 font-bold">
                    {batch.originalFilename} ({batch.verification?.valid ?? batch.validRecords}{' '}
                    leads)
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-orange-600 transition-colors">
                <ChevronRight className="w-5 h-5 rotate-90" />
              </div>
            </div>

            {isLoadingBatches ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs font-black text-slate-600  uppercase tracking-widest px-3">
                  Recent Audiences
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                  {verifiedBatches?.map((batch) => (
                    <div
                      key={batch.id}
                      onClick={() => handleBatchSelect(batch.id)}
                      className={`group flex items-center justify-between p-2 rounded-lg border-2 transition-all cursor-pointer relative overflow-hidden ${watchListBatchId === batch.id ? 'bg-orange-600 border-orange-600 shadow-sm shadow-orange-600/20' : 'bg-white border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-md'}`}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all ${watchListBatchId === batch.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600'}`}
                        >
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className={`text-sm font-bold truncate transition-colors ${watchListBatchId === batch.id ? 'text-white' : 'text-slate-800'}`}
                          >
                            {batch.originalFilename}
                          </p>
                          <p
                            className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${watchListBatchId === batch.id ? 'text-white/60' : 'text-slate-400'}`}
                          >
                            {batch.verification?.valid ?? batch.validRecords} PROSPECTS
                          </p>
                        </div>
                      </div>

                      {watchListBatchId === batch.id && (
                        <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-orange-600 animate-in zoom-in duration-300">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  ))}
                  {verifiedBatches.length === 0 && (
                    <div className="col-span-2 text-center py-12 bg-slate-50/50 rounded-lg border-2 border-dashed border-slate-100">
                      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <Database className="w-7 h-7 text-slate-200" />
                      </div>
                      <p className="text-sm font-bold text-slate-400">
                        Your saved audiences will appear here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showUploadModal && (
        <ShowUpload
          setShowUploadModal={setShowUploadModal}
          uploadStep={uploadStep}
          resetUploadState={() => {
            setUploadStep(1);
            setUploadedFile(null);
          }}
          handleFileUpload={handleFileUploadWrapper}
          mapping={mapping}
          setMapping={setMapping}
          fileHeaders={fileHeaders}
          setUploadStep={setUploadStep}
          handleContactsUpload={handleContactsUpload}
          uploading={uploadBatch.isPending}
        />
      )}
    </div>
  );
};

export default ImportLeadsStep;
