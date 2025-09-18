import React, { useEffect, useState } from 'react';
import { AlertTriangle, Shield, CheckCircle, FileText, Download } from 'lucide-react';
import { useMedicationContext } from '../../context/MedicationContext';
import { useInteractionCheck } from '../../hooks/useMedications';
import { usePDFExport } from '../../hooks/usePDFExport';
import InteractionCard from './InteractionCard';
import PatientInfoModal from '../common/PatientInfoModal';

export default function InteractionResults() {
  const { medications, getMedicationsForInteractionCheck } = useMedicationContext();
  const { interactions, isChecking, error, checkInteractions } = useInteractionCheck();
  const { exportInteractionReport, isExporting, exportError, clearError } = usePDFExport();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-check interactions when medications change
  useEffect(() => {
    if (medications.length >= 2) {
      const medicationsForCheck = getMedicationsForInteractionCheck();
      checkInteractions(medicationsForCheck);
    }
  }, [medications, getMedicationsForInteractionCheck, checkInteractions]);

  // Don't show component if less than 2 medications
  if (medications.length < 2) {
    return null;
  }

  const getSeverityStats = () => {
    const stats = { major: 0, moderate: 0, minor: 0, total: 0 };
    
    interactions.forEach(interactionPair => {
      interactionPair.interactions.forEach(interaction => {
        stats.total++;
        const severity = interaction.severity?.toLowerCase() || 'minor';
        if (severity.includes('major') || severity.includes('severe')) {
          stats.major++;
        } else if (severity.includes('moderate')) {
          stats.moderate++;
        } else {
          stats.minor++;
        }
      });
    });
    
    return stats;
  };

  const severityStats = getSeverityStats();
  const hasInteractions = interactions.length > 0;

  // Handle PDF export
  const handleExportClick = () => {
    setIsModalOpen(true);
    clearError();
  };

  const handleExportWithPatientInfo = async (patientInfo) => {
    const result = await exportInteractionReport(medications, interactions, patientInfo);
    
    if (result.success) {
      setIsModalOpen(false);
      // Could add a success notification here
    }
    // Error handling is managed by the hook
  };

  return (
    <div>
      {/* iOS-style Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">
          Interactions
        </h2>
        
        <div className="flex items-center space-x-3">
          {!isChecking && (
            <div className="flex items-center space-x-2">
              {hasInteractions ? (
                severityStats.major > 0 ? (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                )
              ) : (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
              <span className={`text-[15px] font-medium ${
                hasInteractions 
                  ? severityStats.major > 0
                    ? 'text-red-600'
                    : 'text-yellow-600'
                  : 'text-green-600'
              }`}>
                {hasInteractions 
                  ? `${severityStats.total} found`
                  : 'None found'
                }
              </span>
            </div>
          )}
          
          {/* iOS-style Export Button */}
          {medications.length >= 2 && !isChecking && (
            <button
              onClick={handleExportClick}
              disabled={isExporting}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-[15px] font-medium text-blue-500 bg-blue-50/60 hover:bg-blue-100/60 border border-blue-200/60 rounded-full transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export drug interaction report as PDF"
            >
              {isExporting ? (
                <>
                  <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* iOS-style Loading State */}
      {isChecking && (
        <div className="text-center py-12">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[15px] text-gray-500 font-medium">Checking interactions...</p>
        </div>
      )}

      {/* iOS-style Error State */}
      {error && !isChecking && (
        <div className="p-4 bg-red-50/80 border border-red-100 rounded-2xl">
          <p className="text-[15px] text-red-600 font-medium text-center">{error}</p>
        </div>
      )}

      {/* iOS-style No Interactions */}
      {!isChecking && !error && !hasInteractions && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100/60 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h3 className="text-[18px] font-semibold text-gray-900 mb-2 tracking-tight">
            No interactions detected
          </h3>
          <p className="text-[15px] text-gray-500">
            Your medications appear safe to take together
          </p>
        </div>
      )}

      {/* iOS-style Interactions Found */}
      {!isChecking && !error && hasInteractions && (
        <div className="space-y-4">
          {interactions.map((interactionPair, index) => (
            <InteractionCard
              key={interactionPair.pairId || index}
              medication1={interactionPair.medication1}
              medication2={interactionPair.medication2}
              interactions={interactionPair.interactions}
            />
          ))}
        </div>
      )}

      {/* iOS-style Export Error */}
      {exportError && (
        <div className="mt-4 p-4 bg-red-50/80 border border-red-100 rounded-2xl">
          <p className="text-[15px] text-red-600 font-medium text-center">{exportError}</p>
          <button
            onClick={clearError}
            className="mt-2 text-[13px] text-red-500 hover:text-red-700 font-medium block mx-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Patient Info Modal */}
      <PatientInfoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExport={handleExportWithPatientInfo}
        isExporting={isExporting}
      />
    </div>
  );
}