export interface Alternative {
  name: string;
  countryCode: string;
  description?: string;
}

export interface Company {
  _id: string;
  name: string;
  boycott: boolean;
  reason?: string;
  alternatives: Alternative[];
  barcodes: string[];
  proofUrls: string[];
  country: string;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
  searchRelevance?: number;
}

export interface CompanyFormData {
  name: string;
  boycott: boolean;
  reason?: string;
  alternatives: Alternative[];
  barcodes: string[];
  proofUrls: string[];
  country: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  isActive: boolean;
  permissions: {
    canCreateCompanies: boolean;
    canEditCompanies: boolean;
    canDeleteCompanies: boolean;
    canBulkUpload: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
  };
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: PaginationInfo;
  error?: string;
}

export interface BulkUploadResult {
  row: number;
  success: boolean;
  company?: string;
  error?: string;
  action?: 'created' | 'updated' | 'no_changes';
  newBarcodes?: string[];
  message?: string;
}

export interface BulkUploadResponse {
  success: boolean;
  message: string;
  results: BulkUploadResult[];
  errors: BulkUploadResult[];
  barcodeConflicts?: Array<{
    row: number;
    company: string;
    conflicts: Array<{
      company: string;
      barcodes: string[];
    }>;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
