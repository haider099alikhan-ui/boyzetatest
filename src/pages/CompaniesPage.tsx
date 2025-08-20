import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import { Company, PaginationInfo } from '../types';
import { companiesApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import DataTable from '../components/DataTable';
import BulkUploadDialog from '../components/BulkUploadDialog';
import toast from 'react-hot-toast';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const fetchCompanies = async (page = 1, search = '') => {
    try {
      setIsLoading(true);
      const response = await companiesApi.getAll(page, 20, search);
      
      if (response.success && response.data) {
        setCompanies(response.data);
        setPagination(response.pagination || null);
      } else {
        toast.error(response.message || 'Failed to fetch companies');
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to fetch companies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (company: Company) => {
    if (hasPermission('canEditCompanies')) {
      navigate(`/edit/${company._id}`);
    } else {
      toast.error('You do not have permission to edit companies');
    }
  };

  const handleDelete = async (company: Company) => {
    if (!hasPermission('canDeleteCompanies')) {
      toast.error('You do not have permission to delete companies');
      return;
    }

    try {
      const response = await companiesApi.delete(company._id);
      
      if (response.success) {
        toast.success('Company deleted successfully');
        // Refresh the current page
        fetchCompanies(currentPage, searchTerm);
      } else {
        toast.error(response.message || 'Failed to delete company');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const handleBulkUploadSuccess = () => {
    // Refresh the companies list
    fetchCompanies(currentPage, searchTerm);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage companies and their boycott status</p>
        </div>
        <div className="flex space-x-3">
          {/* Quick Barcode Lookup */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Quick barcode lookup..."
              className="input-field text-sm w-48"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const barcode = e.currentTarget.value.trim();
                  if (barcode) {
                    handleSearch(barcode);
                    e.currentTarget.value = '';
                  }
                }
              }}
            />
            <span className="text-xs text-gray-500">Press Enter</span>
          </div>
          
          {hasPermission('canBulkUpload') && (
            <button
              onClick={() => setShowBulkUpload(true)}
              className="btn-secondary flex items-center"
            >
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
            </button>
          )}
          {hasPermission('canCreateCompanies') && (
            <button
              onClick={() => navigate('/add')}
              className="btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      {pagination && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-gray-900">{pagination.totalItems}</div>
            <div className="text-sm text-gray-600">Total Companies</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-red-600">
              {companies.filter(c => c.boycott).length}
            </div>
            <div className="text-sm text-gray-600">Boycotted</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="text-2xl font-bold text-green-600">
              {companies.filter(c => !c.boycott).length}
            </div>
            <div className="text-sm text-gray-600">Safe to Support</div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        companies={companies}
        onEdit={handleEdit}
        onDelete={handleDelete}
        pagination={pagination || undefined}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        isLoading={isLoading}
        canEdit={hasPermission('canEditCompanies')}
        canDelete={hasPermission('canDeleteCompanies')}
      />

      {/* Bulk Upload Dialog */}
      {hasPermission('canBulkUpload') && (
        <BulkUploadDialog
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          onSuccess={handleBulkUploadSuccess}
        />
      )}
    </div>
  );
};

export default CompaniesPage;
