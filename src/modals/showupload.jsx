import {
  Building,
  FileSpreadsheet,
  Globe,
  Mail,
  MapPin,
  Phone,
  Upload,
  User,
  X,
} from "lucide-react";
import Button from "../components/ui/button";
import { useRef } from "react";
import Modal from "../components/shared/modal";
import * as XLSX from "xlsx";

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
  const fileInputRef = useRef(null);

  // Handle file upload locally to show preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      ".xlsx",
      ".xls",
    ];

    if (
      !validTypes.some(
        (type) => file.type.includes(type) || file.name.endsWith(type),
      )
    ) {
      alert("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    // Parse the file to show headers
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
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
            if (lowerHeader.includes("email")) autoMapping.email = header;
            if (
              lowerHeader.includes("name") &&
              !lowerHeader.includes("first") &&
              !lowerHeader.includes("last")
            )
              autoMapping.name = header;
            if (lowerHeader.includes("first")) autoMapping.firstName = header;
            if (lowerHeader.includes("last")) autoMapping.lastName = header;
            if (lowerHeader.includes("company")) autoMapping.company = header;
            if (lowerHeader.includes("phone")) autoMapping.phone = header;
            if (lowerHeader.includes("city")) autoMapping.city = header;
            if (lowerHeader.includes("country")) autoMapping.country = header;
          });

          setMapping((prev) => ({ ...prev, ...autoMapping }));
          setUploadStep(2);
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert(
          "Error reading Excel file. Please ensure it's a valid Excel file.",
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => setShowUploadModal(false)}
      maxWidth="max-w-2xl"
      closeOnBackdrop={true}
    >
      <div className="flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileSpreadsheet className="w-6 h-6 text-green-600 mr-3" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Upload Contact List
                  </h3>
                  <p className="text-sm text-gray-600">
                    Upload an Excel file (.xlsx) with your contacts
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  resetUploadState();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {uploadStep === 1 ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
                  <FileSpreadsheet className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Excel File
                </h4>
                <p className="text-gray-600 mb-6">
                  Upload an Excel (.xlsx or .xls) file containing your contact
                  list
                </p>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:border-blue-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Click to upload or drag & drop
                  </p>

                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Browse Files
                  </Button>

                  <p className="text-xs text-gray-500 mt-4">
                    Supported formats: .xlsx, .xls
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Field Mapping
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Map your spreadsheet columns to contact fields
                  </p>
                </div>

                <div className="space-y-4">
                  {Object.keys(mapping).map((field) => (
                    <div
                      key={field}
                      className="flex items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-10 h-10 rounded-lg bg-white border flex items-center justify-center mr-4">
                        {field === "email" && (
                          <Mail className="w-4 h-4 text-blue-600" />
                        )}
                        {field === "name" && (
                          <User className="w-4 h-4 text-green-600" />
                        )}
                        {field === "firstName" && (
                          <User className="w-4 h-4 text-green-600" />
                        )}
                        {field === "lastName" && (
                          <User className="w-4 h-4 text-green-600" />
                        )}
                        {field === "company" && (
                          <Building className="w-4 h-4 text-purple-600" />
                        )}
                        {field === "phone" && (
                          <Phone className="w-4 h-4 text-red-600" />
                        )}
                        {field === "city" && (
                          <MapPin className="w-4 h-4 text-orange-600" />
                        )}
                        {field === "country" && (
                          <Globe className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field === "email" && "Email Address"}
                          {field === "name" && "Full Name"}
                          {field === "firstName" && "First Name"}
                          {field === "lastName" && "Last Name"}
                          {field === "company" && "Company"}
                          {field === "phone" && "Phone Number"}
                          {field === "city" && "City"}
                          {field === "country" && "Country"}
                          {field === "email" && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <select
                          value={mapping[field]}
                          onChange={(e) =>
                            setMapping({
                              ...mapping,
                              [field]: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select column...</option>
                          {fileHeaders.map((header) => (
                            <option key={header} value={header}>
                              {header}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="outline" onClick={() => setUploadStep(1)}>
                    Back
                  </Button>
                  <div className="flex items-center space-x-3">
                    <Button variant="outline" onClick={resetUploadState}>
                      Start Over
                    </Button>
                    <Button
                      onClick={handleContactsUpload}
                      disabled={!mapping.email || uploading}
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload List
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ShowUpload;
