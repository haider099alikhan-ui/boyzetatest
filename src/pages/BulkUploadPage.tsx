import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText, CheckCircle } from 'lucide-react';
import BulkUploadDialog from '../components/BulkUploadDialog';

const BulkUploadPage = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const navigate = useNavigate();

  const handleUploadSuccess = () => {
    // Navigate back to companies page after successful upload
    navigate('/');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Upload Companies</h1>
          <p className="text-gray-600">Import multiple companies from a CSV file</p>
        </div>
      </div>

      {/* Upload Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center mb-4">
            <Upload className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">How to Upload</h3>
          </div>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Prepare your CSV file with the required columns</li>
            <li>Ensure company names and reasons are provided</li>
            <li>Use semicolons (;) to separate multiple values</li>
            <li>Upload the file and review the results</li>
          </ol>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <FileText className="h-6 w-6 text-primary-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">CSV Format</h3>
          </div>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Required columns:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>name - Company name</li>
              <li>boycott - true/false or yes/no</li>
              <li>reason - Reason for boycott status</li>
            </ul>
            <p className="mt-2"><strong>Optional columns:</strong></p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>alternatives - Alternative companies (separate with ;)</li>
              <li>barcodes - Product barcodes (separate with ;)</li>
              <li>proofurls - Evidence URLs (separate with ;)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Button */}
      <div className="text-center">
        <button
          onClick={() => setShowUploadDialog(true)}
          className="btn-primary text-lg px-8 py-3"
        >
          <Upload className="h-5 w-5 mr-2" />
          Start Bulk Upload
        </button>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900">Smart Merging</h4>
          <p className="text-sm text-gray-600">
            New barcodes are added to existing companies instead of creating duplicates
          </p>
        </div>
        <div className="text-center p-4">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900">Validation</h4>
          <p className="text-sm text-gray-600">
            Automatic validation of barcodes, URLs, and required fields
          </p>
        </div>
        <div className="text-center p-4">
          <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <h4 className="font-medium text-gray-900">Detailed Results</h4>
          <p className="text-sm text-gray-600">
            See exactly which rows succeeded and which failed with error details
          </p>
        </div>
      </div>

      {/* Upload Dialog */}
      <BulkUploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default BulkUploadPage;
