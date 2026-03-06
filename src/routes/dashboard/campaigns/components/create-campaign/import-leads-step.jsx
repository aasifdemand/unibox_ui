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
} from 'lucide-react';
import ShowUpload from '../../../../../modals/showupload';
import { useUploadBatch } from '../../../../../hooks/useBatches';

const ImportLeadsStep = ({
    setValue,
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
            toast.error(t('campaigns.msg_upload_failed'));
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    Easily add or update Leads /Contacts
                </h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                    How would you like to get contacts into your list?
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-4">
                {/* Option 1: Upload CSV/Excel */}
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">
                                Upload CSV File
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                Import from external spreadsheet
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => setShowUploadModal(true)}
                        className="border-2 border-dashed border-slate-200 rounded-[2rem] p-12 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all bg-slate-50/30"
                    >
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                            <Upload className="w-8 h-8" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-base font-black text-slate-800">
                                Click to <span className="text-blue-600">browse</span> or drag and drop
                            </p>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                                Upload your CSV files to import leads.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 px-2">
                        <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                            <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest leading-relaxed">
                                Fast import with auto-field mapping & validation
                            </p>
                        </div>
                    </div>
                </div>

                {/* Option 2: Import from Saved Lists (The Prominent Reuse Option) */}
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Database className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest">
                                Import from Saved Lists
                            </h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                Reuse your existing audiences
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group/search">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-600 transition-colors" />
                            </div>
                            <select
                                className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                                value={watchListBatchId || ''}
                                onChange={(e) => handleBatchSelect(e.target.value)}
                            >
                                <option value="">Select & search lead list</option>
                                {verifiedBatches.map(batch => (
                                    <option key={batch.id} value={batch.id}>
                                        {batch.originalFilename} ({batch.validRecords} leads)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isLoadingBatches ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-6 h-6 text-indigo-200 animate-spin" />
                            </div>
                        ) : (
                            <div className="max-h-60 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {verifiedBatches.slice(0, 4).map((batch) => (
                                    <div
                                        key={batch.id}
                                        onClick={() => handleBatchSelect(batch.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${watchListBatchId === batch.id ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-50 bg-slate-50/50 hover:border-indigo-200 hover:bg-white'}`}
                                    >
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${watchListBatchId === batch.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-100'}`}>
                                                <Users className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 truncate">{batch.originalFilename}</span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{batch.validRecords}</span>
                                            {watchListBatchId === batch.id && <Check className="w-4 h-4 text-emerald-500" />}
                                        </div>
                                    </div>
                                ))}
                                {verifiedBatches.length === 0 && (
                                    <div className="text-center py-10">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest tracking-[0.2em]">No saved lists found</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.15em] leading-relaxed text-center px-4">
                        Only valid emails are uploaded to help reduce campaign bounce rates. Quick and easy import in just a few clicks.
                    </p>
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
