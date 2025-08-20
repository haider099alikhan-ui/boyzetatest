import { useState, useMemo } from 'react';
import { Search, Edit, Trash2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Company } from '../types';
import { COUNTRIES } from '../utils/countries';

interface DataTableProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
  onSearch?: (searchTerm: string) => void;
  isLoading?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

const DataTable = ({ 
  companies, 
  onEdit, 
  onDelete, 
  pagination, 
  onPageChange, 
  onSearch,
  isLoading = false,
  canEdit = true,
  canDelete = true
}: DataTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(searchTerm);
  };

  const handleDelete = (company: Company) => {
    setShowDeleteConfirm(null);
    onDelete(company);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatBarcodes = (barcodes: string[]) => {
    if (barcodes.length === 0) return 'No barcodes';
    if (barcodes.length === 1) return barcodes[0];
    return `${barcodes[0]} +${barcodes.length - 1} more`;
  };

  const formatAlternatives = (alternatives: any[]) => {
    if (alternatives.length === 0) return 'No alternatives';
    
    // Group alternatives by country
    const grouped = alternatives.reduce((acc, alt) => {
      const countryCode = alt.countryCode || 'GLOBAL';
      if (!acc[countryCode]) acc[countryCode] = [];
      (acc[countryCode] as string[]).push(alt.name);
      return acc;
    }, {} as Record<string, string[]>);

    // Format the display
    const formatted = Object.entries(grouped).map(([country, names]) => {
      const countryFlag = country === 'GLOBAL' ? '🌍' : getCountryFlag(country);
      const countryName = country === 'GLOBAL' ? 'Global' : getCountryName(country);
      return `${countryFlag} ${countryName}: ${names.join(', ')}`;
    });

    return formatted.join(' | ');
  };

  const getCountryFlag = (code: string) => {
    const country = COUNTRIES.find(c => c.code === code);
    return country ? country.flag || '🌍' : '🌍';
  };

  const getCountryName = (code: string) => {
    const country = COUNTRIES.find(c => c.code === code);
    return country ? country.name : code;
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="space-y-4">
        {/* Basic Search */}
        <div className="flex items-center space-x-4">
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search companies by name, barcode, reason, or alternatives..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </form>
          <button
            onClick={() => onSearch?.(searchTerm)}
            className="btn-primary"
          >
            Search
          </button>
          <button
            onClick={() => {
              setSearchTerm('');
              onSearch?.('');
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
        
        {/* Search Tips */}
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <div className="font-medium mb-1">💡 Search Tips:</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <div>• <strong>Company Name:</strong> "Nike", "Coca-Cola"</div>
            <div>• <strong>Barcode:</strong> "1234567890123"</div>
            <div>• <strong>Reason:</strong> "labor rights", "environmental"</div>
            <div>• <strong>Alternatives:</strong> "Adidas", "Pepsi"</div>
            <div>• <strong>Status:</strong> "boycott" or "safe"</div>
            <div>• <strong>Partial:</strong> "nik" will find "Nike"</div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company & Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Barcodes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alternatives
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Loading companies...
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No companies found
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {company.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {company.reason && company.reason.length > 50 
                            ? `${company.reason.substring(0, 50)}...` 
                            : company.reason || 'No reason provided'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.country ? getCountryFlag(company.country) + ' ' + getCountryName(company.country) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.boycott 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {company.boycott ? 'Boycott' : 'Safe'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatBarcodes(company.barcodes)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatAlternatives(company.alternatives)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(company.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {canEdit && (
                          <button
                            onClick={() => onEdit(company)}
                            className="text-primary-600 hover:text-primary-900 p-1 rounded hover:bg-primary-50"
                            title="Edit Company"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => setShowDeleteConfirm(company._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete Company"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                        {!canEdit && !canDelete && (
                          <span className="text-gray-400 text-xs">No actions available</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing page {pagination.currentPage} of {pagination.totalPages} 
            ({pagination.totalItems} total companies)
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this company? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const company = companies.find(c => c._id === showDeleteConfirm);
                  if (company) handleDelete(company);
                }}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
