import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Trash2, Globe } from 'lucide-react';
import { CompanyFormData, Alternative } from '../types';
import { COUNTRIES } from '../utils/countries';

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200, 'Company name cannot exceed 200 characters'),
  boycott: z.boolean(),
  reason: z.string().min(1, 'Reason is required').max(1000, 'Reason cannot exceed 1000 characters'),
  country: z.string().min(1, 'Country is required'),
  alternatives: z.array(z.object({
    name: z.string().min(1, 'Alternative name is required').max(200, 'Alternative name cannot exceed 200 characters'),
    countryCode: z.string().min(1, 'Country code is required'),
    description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  })),
  barcodes: z.array(z.string().regex(/^\d{8,14}$/, 'Barcode must be 8-14 digits')),
  proofUrls: z.array(z.string().url('Invalid URL format')),
});

interface CompanyFormProps {
  initialData?: Partial<CompanyFormData>;
  onSubmit: (data: CompanyFormData) => void;
  isLoading?: boolean;
  submitText?: string;
}

const CompanyForm = ({ initialData, onSubmit, isLoading = false, submitText = 'Save Company' }: CompanyFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: initialData?.name || '',
      boycott: initialData?.boycott || false,
      reason: initialData?.reason || '',
      country: initialData?.country || 'GLOBAL',
      alternatives: initialData?.alternatives?.length ? initialData.alternatives : [{ name: '', countryCode: 'GLOBAL', description: '' }],
      barcodes: initialData?.barcodes || [''],
      proofUrls: initialData?.proofUrls || [''],
    },
  });

  const boycott = watch('boycott');

  const {
    fields: alternativesFields,
    append: appendAlternative,
    remove: removeAlternative,
  } = useFieldArray({
    control,
    name: 'alternatives',
  });

  const {
    fields: barcodesFields,
    append: appendBarcode,
    remove: removeBarcode,
  } = useFieldArray({
    control,
    name: 'barcodes',
  });

  const {
    fields: proofUrlsFields,
    append: appendProofUrl,
    remove: removeProofUrl,
  } = useFieldArray({
    control,
    name: 'proofUrls',
  });

  const onFormSubmit = (data: CompanyFormData) => {
    // Filter out empty alternatives and other fields
    const filteredData = {
      ...data,
      alternatives: data.alternatives.filter(alt => alt.name.trim() !== ''),
      barcodes: data.barcodes.filter(barcode => barcode.trim() !== ''),
      proofUrls: data.proofUrls.filter(url => url.trim() !== ''),
    };
    onSubmit(filteredData);
  };

  const addAlternative = () => {
    appendAlternative({ name: '', countryCode: 'GLOBAL', description: '' });
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Company Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              {...register('name')}
              type="text"
              id="name"
              className="input-field"
              placeholder="e.g., Pepsi, Coca-Cola, Nestlé"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Country */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Market Country *
            </label>
            <select
              {...register('country')}
              id="country"
              className="input-field"
            >
              {COUNTRIES.map(country => (
                <option key={country.code} value={country.code}>
                  {country.flag} {country.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
            )}
          </div>

          {/* Boycott Status */}
          <div>
            <label className="flex items-center">
              <input
                {...register('boycott')}
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                This company should be boycotted
              </span>
            </label>
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Boycott *
            </label>
            <textarea
              {...register('reason')}
              id="reason"
              rows={3}
              className="input-field"
              placeholder="Explain why this company should be boycotted..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Barcodes */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Barcodes</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add one or more barcodes associated with this company's products.
        </p>
        
        <div className="space-y-3">
          {barcodesFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-3">
              <input
                {...register(`barcodes.${index}`)}
                type="text"
                className="input-field flex-1"
                placeholder="Enter barcode (8-14 digits)"
              />
              {barcodesFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeBarcode(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {errors.barcodes && (
            <p className="text-sm text-red-600">{errors.barcodes.message}</p>
          )}
          
          <button
            type="button"
            onClick={() => appendBarcode('')}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Another Barcode
          </button>
        </div>
      </div>

      {/* Country-Specific Alternatives */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Alternative Companies by Country</h3>
        <p className="text-sm text-gray-600 mb-4">
          Suggest alternative companies that consumers can support instead, organized by country.
        </p>
        
        <div className="space-y-4">
          {alternativesFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-700">Alternative #{index + 1}</h4>
                {alternativesFields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAlternative(index)}
                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Alternative Name */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Alternative Name *
                  </label>
                  <input
                    {...register(`alternatives.${index}.name`)}
                    type="text"
                    className="input-field text-sm"
                    placeholder="e.g., Dr Pepper, RC Cola"
                  />
                  {errors.alternatives?.[index]?.name && (
                    <p className="mt-1 text-xs text-red-600">{errors.alternatives[index]?.name?.message}</p>
                  )}
                </div>

                {/* Country Code */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Country *
                  </label>
                  <select
                    {...register(`alternatives.${index}.countryCode`)}
                    className="input-field text-sm"
                  >
                    {COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  {errors.alternatives?.[index]?.countryCode && (
                    <p className="mt-1 text-xs text-red-600">{errors.alternatives[index]?.countryCode?.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <input
                    {...register(`alternatives.${index}.description`)}
                    type="text"
                    className="input-field text-sm"
                    placeholder="e.g., Organic alternative, Local brand"
                  />
                  {errors.alternatives?.[index]?.description && (
                    <p className="mt-1 text-xs text-red-600">{errors.alternatives[index]?.description?.message}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addAlternative}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Alternative Company
          </button>
        </div>
        
        {errors.alternatives && (
          <p className="text-sm text-red-600">{errors.alternatives.message}</p>
        )}
      </div>

      {/* Proof URLs */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Proof URLs</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add URLs to articles, news, or other sources that provide evidence for the boycott.
        </p>
        
        <div className="space-y-3">
          {proofUrlsFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-3">
              <input
                {...register(`proofUrls.${index}`)}
                type="url"
                className="input-field flex-1"
                placeholder="https://example.com/article"
              />
              {proofUrlsFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProofUrl(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {errors.proofUrls && (
            <p className="text-sm text-red-600">{errors.proofUrls.message}</p>
          )}
          
          <button
            type="button"
            onClick={() => appendProofUrl('')}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Proof URL
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Saving...' : submitText}
        </button>
      </div>
    </form>
  );
};

export default CompanyForm;
