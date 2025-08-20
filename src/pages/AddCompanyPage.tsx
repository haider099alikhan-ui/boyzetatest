import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CompanyFormData } from '../types';
import { companiesApi } from '../services/api';
import CompanyForm from '../components/CompanyForm';
import toast from 'react-hot-toast';

const AddCompanyPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: CompanyFormData) => {
    try {
      setIsLoading(true);
      const response = await companiesApi.create(data);
      
      if (response.success) {
        toast.success('Company created successfully');
        navigate('/');
      } else {
        toast.error(response.message || 'Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Company</h1>
          <p className="text-gray-600">Create a new company entry with barcodes and boycott information</p>
        </div>
      </div>

      {/* Company Form */}
      <CompanyForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitText="Create Company"
      />
    </div>
  );
};

export default AddCompanyPage;
