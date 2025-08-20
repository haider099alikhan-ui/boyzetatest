import { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { CompanyFormData, BulkUploadResponse } from '../types';
import { bulkUploadApi } from '../services/api';
import toast from 'react-hot-toast';

interface BulkUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BulkUploadDialog = ({ isOpen, onClose, onSuccess }: BulkUploadDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<BulkUploadResponse | null>(null);
  const [csvData, setCsvData] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvData(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (csvData: string): CompanyFormData[] => {
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const companies: CompanyFormData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const company: CompanyFormData = {
        name: '',
        boycott: false,
        reason: '',
        country: 'GLOBAL',
        alternatives: [],
        barcodes: [],
        proofUrls: []
      };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        
        switch (header) {
          case 'name':
            company.name = value;
            break;
          case 'boycott':
            company.boycott = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
            break;
          case 'reason':
            company.reason = value;
            break;
          case 'country':
            company.country = value || 'GLOBAL';
            break;
          case 'alternatives':
            if (value) {
              // Parse alternatives in format: "Name:CountryCode:Description;Name2:CountryCode2:Description2"
              company.alternatives = value.split(';').map(alt => {
                const parts = alt.trim().split(':');
                return {
                  name: parts[0]?.trim() || '',
                  countryCode: parts[1]?.trim() || 'GLOBAL',
                  description: parts[2]?.trim() || ''
                };
              }).filter(alt => alt.name); // Only keep alternatives with names
            }
            break;
          case 'barcodes':
            company.barcodes = value ? value.split(';').map(b => b.trim()).filter(b => b) : [];
            break;
          case 'proofurls':
          case 'proof_urls':
            company.proofUrls = value ? value.split(';').map(u => u.trim()).filter(u => u) : [];
            break;
        }
      });

      // Only add if name and reason are provided
      if (company.name && company.reason) {
        companies.push(company);
      }
    }

    return companies;
  };

  const handleUpload = async () => {
    if (!csvData.trim()) {
      toast.error('Please upload a CSV file first');
      return;
    }

    try {
      setIsUploading(true);
      const companies = parseCSV(csvData);
      
      if (companies.length === 0) {
        toast.error('No valid companies found in CSV');
        return;
      }

      const response = await bulkUploadApi.upload(companies);
      setUploadResults(response);
      
      if (response.success) {
        toast.success(`Successfully uploaded ${response.summary.successful} companies`);
        onSuccess();
      } else {
        toast.error('Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Show specific error message if available
      if (error.response?.data?.message) {
        toast.error(`Upload failed: ${error.response.data.message}`);
      } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        const errorMessages = error.response.data.errors.map((err: any) => err.message).join(', ');
        toast.error(`Upload failed: ${errorMessages}`);
      } else if (error.response?.data?.barcodeConflicts && error.response.data.barcodeConflicts.length > 0) {
        const conflicts = error.response.data.barcodeConflicts.map((conflict: any) => conflict.barcode).join(', ');
        toast.error(`Barcode conflicts found: ${conflicts}`);
      } else {
        toast.error('Failed to upload companies');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setCsvData('');
    setUploadResults(null);
    onClose();
  };

  const downloadSampleCSV = () => {
    const sampleData = `name,boycott,reason,country,alternatives,barcodes,proofurls
Sample Company A,true,Environmental concerns,IN,"Dr Pepper:IN:Organic alternative;RC Cola:PK:Local brand",1111111111111;2222222222222,https://example.com/article1
Sample Company B,false,No current issues,US,"Local Brand:US:Regional alternative",3333333333333,https://example.com/article2`;
    
    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-companies.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Bulk Upload Companies</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">CSV Format Requirements</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• First row should contain headers: name, boycott, reason, country, alternatives, barcodes, proofurls</li>
              <li>• boycott: true/false or yes/no</li>
              <li>• country: Country code (e.g., IN, PK, US) or leave empty for GLOBAL</li>
              <li>• alternatives: Format: "Name:CountryCode:Description;Name2:CountryCode2:Description2"</li>
              <li>• barcodes, proofurls: separate multiple values with semicolons (;)</li>
              <li>• name and reason are required fields</li>
              <li>• <strong>Barcodes must be unique across all companies (8-14 digits)</strong></li>
            </ul>
            <button
              onClick={downloadSampleCSV}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Download Sample CSV
            </button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-primary"
              >
                Choose CSV File
              </button>
              <p className="mt-2 text-sm text-gray-600">
                or drag and drop a CSV file here
              </p>
            </div>
            {csvData && (
              <div className="mt-4 text-sm text-green-600">
                <FileText className="inline h-4 w-4 mr-1" />
                File loaded successfully
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!csvData || isUploading}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload Companies'}
            </button>
          </div>

          {/* Results */}
          {uploadResults && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Upload Results</h3>
              
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {uploadResults.summary.successful}
                  </div>
                  <div className="text-sm text-green-800">Successful</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {uploadResults.summary.failed}
                  </div>
                  <div className="text-sm text-red-800">Failed</div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {uploadResults.summary.total}
                  </div>
                  <div className="text-sm text-blue-800">Total</div>
                </div>
              </div>

              {/* Detailed Results */}
              {uploadResults.errors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-800 mb-2">Errors</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {uploadResults.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700 mb-1">
                        Row {error.row}: {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadResults.results.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-800 mb-2">Successful Uploads</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {uploadResults.results.map((result, index) => (
                      <div key={index} className="text-sm text-green-700 mb-1">
                        Row {result.row}: {result.company}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="btn-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadDialog;
