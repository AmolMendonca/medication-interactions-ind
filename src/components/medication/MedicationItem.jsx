import React from 'react';
import { Trash2, Pill, Info } from 'lucide-react';

export default function MedicationItem({ medication, onRemove, showDetails = false }) {
  const formatMedicationName = (med) => {
    return med.name || med.synonym || 'Unknown medication';
  };

  const getMedicationTypeLabel = (tty) => {
    const ttyMap = {
      'SCD': 'Clinical Drug',
      'SBD': 'Branded Drug', 
      'GPCK': 'Generic Pack',
      'BPCK': 'Branded Pack',
      'IN': 'Ingredient',
      'PIN': 'Precise Ingredient'
    };
    return ttyMap[tty] || tty || 'Unknown';
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Pill className="h-5 w-5 text-primary-600" />
          </div>
        </div>
        
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {formatMedicationName(medication)}
          </p>
          
          <div className="flex items-center space-x-4 mt-1">
            <span className="text-xs text-gray-500">
              {getMedicationTypeLabel(medication.tty)}
            </span>
            <span className="text-xs text-gray-400">
              RxCUI: {medication.rxcui}
            </span>
          </div>
          
          {showDetails && medication.addedAt && (
            <p className="text-xs text-gray-400 mt-1">
              Added {new Date(medication.addedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {showDetails && (
          <button
            className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
            aria-label="More information"
          >
            <Info className="h-4 w-4" />
          </button>
        )}
        
        <button
          onClick={() => onRemove(medication.id)}
          className="p-1 text-gray-400 hover:text-danger-600 transition-colors"
          aria-label={`Remove ${formatMedicationName(medication)}`}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}