import React from 'react';
import { X } from 'lucide-react';
import { useMedicationContext } from '../../context/MedicationContext';

export default function MedicationList() {
  const { medications, removeMedication, clearAllMedications } = useMedicationContext();

  if (medications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-sm">No medications added yet</p>
      </div>
    );
  }

  const formatMedicationName = (medication) => {
    return medication.name || medication.synonym || 'Unknown medication';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Your medications
        </h2>
        
        {medications.length > 1 && (
          <button
            onClick={clearAllMedications}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-2">
        {medications.map((medication, index) => (
          <div
            key={medication.id}
            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-lg hover:border-gray-200 transition-colors"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-medium text-gray-600">
                  {index + 1}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {formatMedicationName(medication)}
                </p>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-xs text-gray-500">
                    {medication.isIndianMedicine ? 'Indian' : 'International'}
                  </span>
                  {medication.genericName && (
                    <span className="text-xs text-gray-400">
                      {medication.genericName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => removeMedication(medication.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={`Remove ${formatMedicationName(medication)}`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {medications.length >= 2 && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600 text-center">
            Checking interactions between {medications.length} medications
          </p>
        </div>
      )}
    </div>
  );
}