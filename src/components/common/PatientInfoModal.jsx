// src/components/common/PatientInfoModal.jsx
import React, { useState } from 'react';
import { X, FileText, User, Calendar, Stethoscope } from 'lucide-react';

export default function PatientInfoModal({ 
  isOpen, 
  onClose, 
  onExport, 
  isExporting 
}) {
  const [patientInfo, setPatientInfo] = useState({
    name: '',
    dob: '',
    provider: ''
  });

  const handleInputChange = (field, value) => {
    setPatientInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExport = () => {
    onExport(patientInfo);
  };

  const handleSkipAndExport = () => {
    onExport({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Export Interaction Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              Adding patient information helps your healthcare provider better understand 
              the context of this drug interaction analysis.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-700">
                <strong>Privacy Note:</strong> All information is processed locally and 
                included only in your downloaded PDF. No data is stored on our servers.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 mr-2" />
                Patient Name
              </label>
              <input
                type="text"
                value={patientInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter patient name (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Date of Birth
              </label>
              <input
                type="date"
                value={patientInfo.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Stethoscope className="w-4 h-4 mr-2" />
                Healthcare Provider
              </label>
              <input
                type="text"
                value={patientInfo.provider}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                placeholder="Dr. Smith, ABC Medical Center (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSkipAndExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Skip & Export Report
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate PDF Report
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
