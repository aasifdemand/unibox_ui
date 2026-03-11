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
            toast.error(error.message || t('campaigns.msg_upload_failed'));
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-12 pt-8 pb-16 animate-in fade-in duration-500">
            {/* Minimal Header */}
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    Add Leads to Campaign
                </h2>
                <p className="text-sm font-medium text-slate-500">
                    Import new contacts or select from your saved lists
                </p>
            </div>

            <div className="space-y-10">
                {/* Upload Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Upload className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Option 1: Upload CSV File</h3>
                    </div>

                    <div
                        onClick={() => setShowUploadModal(true)}
                        className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white/50 hover:bg-white rounded-[2rem] p-12 flex flex-col items-center justify-center gap-5 cursor-pointer transition-all group shadow-sm hover:shadow-md"
                    >
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-500">
                            <FileSpreadsheet className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-base font-black text-slate-800">
                                Click to <span className="text-blue-600">browse</span> or drag and drop
                            </p>
                            <p className="text-xs font-medium text-slate-400">
                                Upload your CSV spreadsheet to auto-map fields.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="flex-shrink-0 mx-4 text-xs font-black text-slate-300 uppercase tracking-widest">OR</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Saved Lists Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Database className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Option 2: Import from Saved Lists</h3>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-8">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <select
                                className="w-full pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-[1.5rem] text-sm font-bold text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                                value={watchListBatchId || ''}
                                onChange={(e) => handleBatchSelect(e.target.value)}
                            >
                                <option value="" className="text-slate-400 font-medium">Search your saved lists...</option>
                                {verifiedBatches.map(batch => (
                                    <option key={batch.id} value={batch.id} className="text-slate-900 font-bold">
                                        {batch.originalFilename} ({batch.verification?.valid ?? batch.validRecords} leads)
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                                <div className="w-6 h-6 bg-white shadow-sm border border-slate-100 rounded-md flex items-center justify-center">
                                    <Database className="w-3 h-3 text-slate-400" />
                                </div>
                            </div>
                        </div>

                        {isLoadingBatches ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 group">Available Audiences</p>
                                <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar -mx-2 px-2">
                                    {verifiedBatches.slice(0, 5).map((batch) => (
                                        <div
                                            key={batch.id}
                                            onClick={() => handleBatchSelect(batch.id)}
                                            className={`flex items-center justify-between p-4 rounded-xl transition-all cursor-pointer ${watchListBatchId === batch.id ? 'bg-indigo-50 border border-indigo-100 shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${watchListBatchId === batch.id ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    <Users className="w-4 h-4" />
                                                </div>
                                                <span className={`text-sm font-bold truncate transition-colors ${watchListBatchId === batch.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                                                    {batch.originalFilename}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`text-xs font-bold ${watchListBatchId === batch.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                                                    {batch.verification?.valid ?? batch.validRecords}
                                                </span>
                                                {watchListBatchId === batch.id && <Check className="w-4 h-4 text-indigo-600" />}
                                            </div>
                                        </div>
                                    ))}
                                    {verifiedBatches.length === 0 && (
                                        <div className="text-center py-8">
                                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <Database className="w-4 h-4 text-slate-300" />
                                            </div>
                                            <p className="text-xs font-bold text-slate-400">No saved lists found</p>
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
