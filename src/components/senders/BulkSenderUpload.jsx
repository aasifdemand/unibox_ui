import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Download, X, CheckCircle, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';


const BulkSenderUpload = ({ onUpload, isSubmitting }) => {
  
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [fileName, setFileName] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast.error('The file appears to be empty');
          return;
        }

        // Basic validation and mapping
        const mappedData = jsonData.map(row => ({
          email: row.email || row.Email || '',
          displayName: row.displayName || row.Name || row['Display Name'] || '',
          smtpHost: row.smtpHost || row.host || row.Host || '',
          smtpPort: parseInt(row.smtpPort || row.port || row.Port) || 587,
          smtpSecure: row.smtpSecure !== undefined ? row.smtpSecure : (row.secure !== undefined ? row.secure : true),
          smtpUser: row.smtpUser || row.user || row.User || row.username || row.email || '',
          smtpPassword: row.smtpPassword || row.password || row.Password || '',
          // Imap auto-derivation if not provided
          imapHost: row.imapHost || row.imap_host || (row.smtpHost || row.host || '').replace('smtp', 'imap'),
          imapPort: parseInt(row.imapPort || row.imap_port) || 993,
          imapSecure: row.imapSecure !== undefined ? row.imapSecure : true,
          imapUser: row.imapUser || row.imap_user || row.smtpUser || row.user || row.email || '',
          imapPassword: row.imapPassword || row.imap_password || row.smtpPassword || row.password || '',
        }));

        const validSenders = mappedData.filter(s => s.email && s.smtpHost && s.smtpPassword);
        
        if (validSenders.length === 0) {
          toast.error('No valid sender records found. Please check column headers.');
          return;
        }

        setParsedData(validSenders);
        setFileName(file.name);
        toast.success(`Parsed ${validSenders.length} accounts`);
      } catch (err) {
        console.error('File parsing error:', err);
        toast.error('Failed to parse file. Use CSV or Excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setParsedData(null);
    setFileName('');
  };

  const downloadSample = () => {
    const headers = [['email', 'displayName', 'smtpHost', 'smtpPort', 'smtpSecure', 'smtpUser', 'smtpPassword']];
    const data = [
      ['john@example.com', 'John Smith', 'smtp.example.com', 587, true, 'john@example.com', 'password123'],
      ['jane@example.com', 'Jane Doe', 'smtp.gmail.com', 587, true, 'jane@example.com', 'app-password-here']
    ];
    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, 'mailbox_bulk_sample.xlsx');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div>
          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-tighter">Bulk Email Addition</h4>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Upload CSV or Excel to add multiple accounts</p>
        </div>
        <button 
          onClick={downloadSample}
          className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="text-[9px] font-extrabold uppercase tracking-widest">Sample File</span>
        </button>
      </div>

      {!parsedData ? (
        <div
          className={`relative border-2 border-dashed rounded-2xl py-8 transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
            dragActive ? 'border-purple-500 bg-purple-50/50 scale-[0.99]' : 'border-slate-200 bg-slate-50/30'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".csv,.xlsx,.xls"
            onChange={handleChange}
          />
          <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-50 flex items-center justify-center">
            <Upload className="w-5 h-5 text-slate-300" />
          </div>
          <div className="text-center">
            <p className="text-[11px] font-extrabold text-slate-700 uppercase tracking-tight">Drop your file here or browse</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Supports CSV, XLSX, XLS</p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-purple-50/50 border-2 border-purple-100 rounded-2xl animate-in zoom-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
                <FileSpreadsheet className="w-4.5 h-4.5 text-purple-600" />
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-slate-800 uppercase tracking-tight truncate max-w-[180px]">{fileName}</p>
                <p className="text-[9px] font-bold text-purple-600 uppercase tracking-widest mt-0.5">{parsedData.length} Accounts detected</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={() => onUpload(parsedData)}
                disabled={isSubmitting}
                className="px-5 py-2 bg-purple-600 text-white rounded-xl text-[9px] font-extrabold uppercase tracking-widest shadow-md shadow-purple-600/10 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                Confirm & Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkSenderUpload;
