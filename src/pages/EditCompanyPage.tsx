import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Company, CompanyFormData } from '../types';
import { companiesApi } from '../services/api';
import CompanyForm from '../components/CompanyForm';
import toast from 'react-hot-toast';

const EditCompanyPage = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchCompany = async () => {
      if (!id) return;
      
      try {
        setIsInitialLoading(true);
        const response = await companiesApi.getById(id);
        
        if (response.success && response.data) {
          setCompany(response.data);
        } else {
          toast.error(response.message || 'Company not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching company:', error);
        toast.error('Failed to fetch company');
        navigate('/');
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchCompany();
  }, [id, navigate]);

  const handleSubmit = async (data: CompanyFormData) => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await companiesApi.update(id, data);
      
      if (response.success) {
        toast.success('Company updated successfully');
        navigate('/');
      } else {
        toast.error(response.message || 'Failed to update company');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading company...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Company not found</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary mt-4"
        >
          Back to Companies
        </button>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Edit Company</h1>
          <p className="text-gray-600">Update company information and barcodes</p>
        </div>
      </div>

      {/* Company Form */}
      <CompanyForm
        initialData={company}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitText="Update Company"
      />
    </div>
  );
};

export default EditCompanyPage;
