import React, { useState, useEffect } from 'react';
import { Building2, AlertTriangle, CheckCircle, Upload, Users, Globe } from 'lucide-react';
import { companiesApi } from '../services/api';
import { Company } from '../types';

interface AnalyticsData {
  totalCompanies: number;
  boycottedCompanies: number;
  safeCompanies: number;
  totalBarcodes: number;
  totalAlternatives: number;
  countriesWithCompanies: number;
  recentUploads: number;
}

const AnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('GLOBAL');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedCountry]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const response = await companiesApi.getAll(1, 1000, ''); // Get all companies for analytics
      
      if (response.success && response.data) {
        const companies = response.data;
        
        // Filter by country if not GLOBAL
        const filteredCompanies = selectedCountry === 'GLOBAL' 
          ? companies 
          : companies.filter(company => company.country === selectedCountry);

        const analyticsData: AnalyticsData = {
          totalCompanies: filteredCompanies.length,
          boycottedCompanies: filteredCompanies.filter(c => c.boycott).length,
          safeCompanies: filteredCompanies.filter(c => !c.boycott).length,
          totalBarcodes: filteredCompanies.reduce((sum, c) => sum + c.barcodes.length, 0),
          totalAlternatives: filteredCompanies.reduce((sum, c) => sum + c.alternatives.length, 0),
          countriesWithCompanies: new Set(companies.map(c => c.country)).size,
          recentUploads: filteredCompanies.filter(c => {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            return new Date(c.createdAt) > oneWeekAgo;
          }).length
        };
        
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center text-gray-500">No analytics data available</div>;
  }

  const boycottPercentage = analytics.totalCompanies > 0 
    ? Math.round((analytics.boycottedCompanies / analytics.totalCompanies) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Country Filter */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Filter by Country:</label>
        <select
          value={selectedCountry}
          onChange={(e) => setSelectedCountry(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="GLOBAL">🌍 Global (All Countries)</option>
          <option value="IN">🇮🇳 India</option>
          <option value="PK">🇵🇰 Pakistan</option>
          <option value="US">🇺🇸 United States</option>
          <option value="GB">🇬🇧 United Kingdom</option>
          <option value="CA">🇨🇦 Canada</option>
          <option value="AU">🇦🇺 Australia</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Companies */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalCompanies}</p>
            </div>
          </div>
        </div>

        {/* Boycotted Companies */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Boycotted</p>
              <p className="text-2xl font-bold text-red-600">{analytics.boycottedCompanies}</p>
              <p className="text-xs text-gray-500">{boycottPercentage}% of total</p>
            </div>
          </div>
        </div>

        {/* Safe Companies */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Safe</p>
              <p className="text-2xl font-bold text-green-600">{analytics.safeCompanies}</p>
            </div>
          </div>
        </div>

        {/* Total Barcodes */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Barcodes</p>
              <p className="text-2xl font-bold text-purple-600">{analytics.totalBarcodes}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Alternatives */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Globe className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Alternatives</p>
              <p className="text-2xl font-bold text-yellow-600">{analytics.totalAlternatives}</p>
            </div>
          </div>
        </div>

        {/* Countries */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Globe className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Countries</p>
              <p className="text-2xl font-bold text-indigo-600">{analytics.countriesWithCompanies}</p>
            </div>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-teal-100 rounded-lg">
              <Upload className="h-6 w-6 text-teal-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Uploads</p>
              <p className="text-2xl font-bold text-teal-600">{analytics.recentUploads}</p>
              <p className="text-xs text-gray-500">Last 7 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Boycott Status Distribution</h3>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Boycotted</span>
              <span>{boycottPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ width: `${boycottPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Safe</span>
              <span>{100 - boycottPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${100 - boycottPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
