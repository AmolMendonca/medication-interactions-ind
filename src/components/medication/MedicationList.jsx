import React from 'react';
import { X } from 'lucide-react';
import { useMedicationContext } from '../../context/MedicationContext';

export default function MedicationList() {
  const { medications, removeMedication, clearAllMedications } = useMedicationContext();

  if (medications.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100/60 rounded-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 rounded-lg"></div>
        </div>
        <p className="text-[15px] text-gray-400 font-medium">No medications added yet</p>
        <p className="text-[13px] text-gray-300 mt-1">Search above to get started</p>
      </div>
    );
  }

  const formatMedicationName = (medication) => {
    return medication.name || medication.synonym || 'Unknown medication';
  };

  return (
    <div>
      {/* iOS-style Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
          Medications
        </h2>
        
        {medications.length > 1 && (
          <button
            onClick={clearAllMedications}
            className="text-[15px] text-blue-500 font-medium hover:text-blue-600 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* iOS-style Card Container */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[20px] border border-gray-200/60 overflow-hidden">
        {medications.map((medication, index) => (
          <div
            key={medication.id}
            className={`
              flex items-center justify-between px-4 py-4
              ${index !== medications.length - 1 ? 'border-b border-gray-100/60' : ''}
              hover:bg-gray-50/60 active:bg-gray-100/60 transition-all duration-150
            `}
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* iOS-style Number Badge */}
              <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[13px] font-semibold text-white">
                  {index + 1}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-medium text-gray-900 truncate leading-[20px]">
                  {formatMedicationName(medication)}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[13px] text-gray-500 leading-[16px]">
                    {medication.isIndianMedicine ? 'Indian' : 'International'}
                  </span>
                  {medication.genericName && (
                    <>
                      <span className="text-[13px] text-gray-300">•</span>
                      <span className="text-[13px] text-gray-400 truncate max-w-[120px] leading-[16px]">
                        {medication.genericName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* iOS-style Remove Button */}
            <button
              onClick={() => removeMedication(medication.id)}
              className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200/60 hover:bg-red-100 active:bg-red-200 flex items-center justify-center transition-all duration-150 group"
              aria-label={`Remove ${formatMedicationName(medication)}`}
            >
              <X className="h-3 w-3 text-gray-500 group-hover:text-red-500 group-active:text-red-600 transition-colors" />
            </button>
          </div>
        ))}
      </div>

      {/* iOS-style Status Indicator */}
      {medications.length >= 2 && (
        <div className="mt-3 px-4 py-2 bg-blue-50/60 border border-blue-100/60 rounded-2xl">
          <p className="text-[13px] text-blue-600 font-medium text-center leading-[16px]">
            Checking interactions between {medications.length} medications
          </p>
        </div>
      )}
    </div>
  );
}