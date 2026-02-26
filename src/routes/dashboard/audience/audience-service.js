import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';

// File upload handlers
export const handleFileUpload = (e, setUploadedFile, setFileHeaders, setUploadStep, setMapping) => {
  const file = e.target.files[0];
  if (!file) return;

  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ltr:ml-excel ltr:mr-excel rtl:ml-excel',
    '.xlsx',
    '.xls',
  ];

  if (!validTypes.some((type) => file.type.includes(type) || file.name.endsWith(type))) {
    toast.error('Please upload an Excel file (.xlsx or .xls)');
    return;
  }

  setUploadedFile(file);
  parseExcelFile(file, setFileHeaders, setUploadStep, setMapping);
};

export const parseExcelFile = (file, setFileHeaders, setUploadStep, setMapping) => {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      if (jsonData.length > 0) {
        const headers = jsonData[0];
        setFileHeaders(headers);
        setUploadStep(2);

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
        });
        setMapping(autoMapping);
      }
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      toast.error("Error reading Excel file. Please ensure it's a valid Excel file.");
    }
  };

  reader.readAsArrayBuffer(file);
};

// Batch record fetching
export const fetchBatchDetails = async (
  batchId,
  getBatchStatus,
  setBatchRecords,
  setBatchStats,
  setIsLoadingRecords,
) => {
  setIsLoadingRecords(true);
  try {
    const batchData = await getBatchStatus(batchId);
    if (batchData) {
      setBatchRecords(batchData.sampleRecords || []);
      setBatchStats(batchData.counts || {});
    }
  } catch (error) {
    console.error('Error loading batch details:', error);
    setBatchRecords([]);
    setBatchStats({});
  } finally {
    setIsLoadingRecords(false);
  }
};

// Filter batches
export const filterBatches = (batches, searchTerm, filterStatus) => {
  return batches.filter((batch) => {
    const matchesSearch =
      searchTerm === '' ||
      batch.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (batch.id && batch.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' || batch.status === filterStatus;

    return matchesSearch && matchesStatus;
  });
};

// Get verification totals
export const calculateVerificationTotals = (batches) => {
  return batches.reduce(
    (acc, batch) => {
      const v = batch.verification || {};
      acc.valid += v.valid || 0;
      acc.invalid += v.invalid || 0;
      acc.risky += v.risky || 0;
      acc.unverified += v.unverified || 0;
      return acc;
    },
    { valid: 0, invalid: 0, risky: 0, unverified: 0 },
  );
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    case 'uploaded':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get record status badge class
export const getRecordStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'parsed':
      return 'bg-green-100 text-green-800';
    case 'duplicate':
      return 'bg-yellow-100 text-yellow-800';
    case 'invalid':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString();
};

// Pagination helper
export const getPaginatedData = (data, currentPage, recordsPerPage) => {
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  return {
    currentRecords: data.slice(indexOfFirstRecord, indexOfLastRecord),
    totalPages: Math.ceil(data.length / recordsPerPage),
    totalRecords: data.length,
    indexOfFirstRecord: indexOfFirstRecord + 1,
    indexOfLastRecord: Math.min(indexOfLastRecord, data.length),
  };
};

// Reset upload state
export const resetUploadState = (setUploadStep, setUploadedFile, setFileHeaders, setMapping) => {
  setUploadStep(1);
  setUploadedFile(null);
  setFileHeaders([]);
  setMapping({
    email: '',
    name: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
    city: '',
    country: '',
  });
};
