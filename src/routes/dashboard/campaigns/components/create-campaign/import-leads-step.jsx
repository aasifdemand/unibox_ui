import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import {
  Users,
  Database,
  Search,
  Check,
  FileSpreadsheet,
  Loader2,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
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
    <div className="max-w-[1100px] mx-auto space-y-12 pt-12 pb-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Refined Header */}
      <div className="flex flex-col items-center text-center space-y-5 max-w-2xl mx-auto">
        <div className="w-14 h-14 rounded-lg bg-purple-600 flex items-center justify-center shadow-2xl shadow-purple-600/20 mb-1">
            <Users className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight leading-tight">
          Add Leads to Campaign
        </h2>
        <p className="text-base font-medium text-slate-500">
          Source your audience for this sequence. Select your preferred method to begin.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative items-stretch">
        {/* ACTION 1: NEW AUDIENCE */}
        <div className="relative group">
           <div className="flex items-center gap-3 mb-4 px-3">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Prospect List</p>
           </div>
           
           <div
              onClick={() => setShowUploadModal(true)}
              className="h-full border border-slate-100 bg-white rounded-xl p-10 flex flex-col transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-purple-600/5 hover:border-purple-300 group/card relative overflow-hidden"
            >
              {/* Subtle Gradient Decor */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full -mr-20 -mt-20 blur-3xl group-hover/card:scale-125 transition-transform duration-700" />

              <div className="flex-1 space-y-8 relative z-10">
                <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-purple-600/20 group-hover/card:bg-purple-700 transition-colors">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-slate-800 leading-tight">
                     Upload CSV / <br/> Spreadsheets
                  </h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-[280px]">
                    Import a list and we&apos;ll automatically map columns to your variables.
                  </p>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-between pt-6 border-t border-slate-100 relative z-10">
                <span className="text-sm font-semibold text-purple-600 flex items-center gap-2 group-hover/card:gap-3 transition-all">
                  Browse Computer <ArrowUpRight className="w-4 h-4" />
                </span>
                <p className="text-xs font-semibold text-slate-400">CSV, XLSX, TXT</p>
              </div>
            </div>
        </div>

        {/* ACTION 2: SAVED LISTS */}
        <div className="relative group">
           <div className="flex items-center gap-3 mb-4 px-3">
              <Database className="w-4 h-4 text-purple-400" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Existing Database</p>
           </div>

           <div className="h-full bg-slate-50 border border-slate-100 rounded-xl p-10 flex flex-col transition-all duration-300 shadow-sm hover:border-purple-300 hover:bg-white group/card">
              <div className="space-y-6 flex-1">
                {/* Search Bar */}
                <div className="relative group/search">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400 group-focus-within/search:text-purple-600 transition-colors" />
                  </div>
                  <select
                    className="w-full pl-11 pr-12 h-12 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-sm font-medium text-slate-800 focus:border-purple-600 transition-all outline-none appearance-none cursor-pointer shadow-sm"
                    value={watchListBatchId || ''}
                    onChange={(e) => handleBatchSelect(e.target.value)}
                  >
                    <option value="" className="text-slate-400">
                      Select a saved list...
                    </option>
                    {verifiedBatches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.originalFilename}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <ChevronRight className="w-4 h-4 rotate-90" />
                  </div>
                </div>

                {/* List Container */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Recent Audiences</p>
                    {verifiedBatches.length > 0 && (
                      <button className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors">Manage All</button>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                    {isLoadingBatches ? (
                      <div className="flex items-center justify-center py-8 bg-white rounded-lg border border-slate-100">
                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                      </div>
                    ) : verifiedBatches.length > 0 ? (
                      verifiedBatches.map((batch) => (
                        <div
                          key={batch.id}
                          onClick={() => handleBatchSelect(batch.id)}
                          className={`group/item flex items-center justify-between p-4 rounded-lg border transition-all cursor-pointer relative overflow-hidden active:scale-[0.98] ${watchListBatchId === batch.id ? 'bg-purple-600 border-purple-700 shadow-md shadow-purple-600/20' : 'bg-white border-slate-200 hover:border-purple-300 hover:shadow-xs'}`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${watchListBatchId === batch.id ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400 group-hover/item:bg-purple-50 group-hover/item:text-purple-600'}`}
                            >
                              <Users className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex flex-col gap-0.5">
                              <p
                                className={`text-sm font-semibold truncate transition-colors ${watchListBatchId === batch.id ? 'text-white' : 'text-slate-800'}`}
                              >
                                {batch.originalFilename}
                              </p>
                              <p
                                className={`text-xs font-medium ${watchListBatchId === batch.id ? 'text-white/70' : 'text-slate-500'}`}
                              >
                                {batch.verification?.valid ?? batch.validRecords} Leads
                              </p>
                            </div>
                          </div>

                          {watchListBatchId === batch.id && (
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm">
                              <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-white rounded-lg border border-dashed border-slate-200">
                         <Database className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                         <p className="text-sm font-medium text-slate-400">No saved audiences</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
