import React from 'react';
import { Trash2, Pill, AlertTriangle, Clock, CheckCircle2, Plus } from 'lucide-react';
import { useMedicationContext } from '../../context/MedicationContext';

export default function MedicationList() {
  const { medications, removeMedication, clearAllMedications } = useMedicationContext();

  if (medications.length === 0) {
    return (
      <div className="text-center py-12">
        {/* Empty State Icon */}
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Pill className="h-8 w-8 text-gray-400" />
        </div>
        
        {/* Empty State Content */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          No medications added yet
        </h3>
        <p className="text-gray-500 text-sm sm:text-base max-w-sm mx-auto leading-relaxed">
          Search and add medications above to check for potential interactions
        </p>
        
        {/* Helpful Hints */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 max-w-md mx-auto">
          <p className="text-xs sm:text-sm text-blue-700 font-medium mb-2">
            💡 Quick Start Tips:
          </p>
          <div className="text-xs sm:text-sm text-blue-600 space-y-1 text-left">
            <p>• Try searching "aspirin" or "tylenol"</p>
            <p>• Use generic or brand names</p>
            <p>• Add 2+ medications to check interactions</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMedicationTypeColor = (medication) => {
    if (medication.isIndianMedicine) {
      return 'bg-green-100 text-green-700 border-green-200';
    }
    
    const tty = medication.tty;
    const colorMap = {
      'SCD': 'bg-blue-100 text-blue-700 border-blue-200',
      'SBD': 'bg-purple-100 text-purple-700 border-purple-200',
      'GPCK': 'bg-orange-100 text-orange-700 border-orange-200',
      'BPCK': 'bg-red-100 text-red-700 border-red-200',
    };
    return colorMap[tty] || 'bg-gray-100 text-gray-700 border-gray-200';
  };
  
  const getMedicationTypeLabel = (medication) => {
    if (medication.isIndianMedicine) {
      return 'Indian Brand';
    }
    
    const ttyMap = {
      'SCD': 'Clinical Drug',
      'SBD': 'Branded Drug',
      'GPCK': 'Generic Pack',
      'BPCK': 'Branded Pack'
    };
    return ttyMap[medication.tty] || medication.tty || 'Medication';
  };
    return (
    <div className="space-y-4">
      {/* Header with Count and Clear All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <span className="text-sm font-semibold text-gray-900">
            {medications.length} medication{medications.length !== 1 ? 's' : ''} added
          </span>
        </div>
        
        {medications.length > 1 && (
          <button
            onClick={clearAllMedications}
            className="text-xs sm:text-sm text-red-500 hover:text-red-600 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Medications Grid - Mobile responsive */}
      <div className="grid gap-3 sm:gap-4">
        {medications.map((medication, index) => (
          <div
            key={medication.id}
            className="group relative bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              {/* Left Side - Medication Info */}
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {/* Medication Icon with Index */}
                <div className="flex-shrink-0 relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Pill className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {/* Medication Number Badge */}
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                
                {/* Medication Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                    {medication.name || medication.synonym || 'Unknown medication'}
                  </h4>
                  
                  {/* Medication Type Badge */}
                  {medication.tty && (
                    <div className="mt-2">
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border
                        ${getMedicationTypeColor(medication.tty)}
                      `}>
                        {getMedicationTypeLabel(medication.tty)}
                      </span>
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                    {medication.rxcui && (
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">RxCUI:</span>
                        <span className="font-mono">{medication.rxcui}</span>
                      </div>
                    )}
                    {medication.addedAt && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Added {formatDate(medication.addedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Side - Remove Button */}
              <button
                onClick={() => removeMedication(medication.id)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 group-hover:opacity-100 opacity-70"
                aria-label={`Remove ${medication.name || 'medication'}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Interaction Check Status */}
      {medications.length >= 2 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Ready for Interaction Check
              </h4>
              <p className="text-sm text-green-700 leading-relaxed">
                Great! With {medications.length} medications added, we can now analyze potential drug interactions. 
                The interaction checker will be available in the next phase.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Single Medication Encouragement */}
      {medications.length === 1 && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Plus className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Add more medications
              </p>
              <p className="text-sm text-blue-700">
                Add at least one more medication to check for potential interactions.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}