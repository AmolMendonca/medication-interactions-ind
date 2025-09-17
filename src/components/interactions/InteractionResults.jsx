import React, { useEffect } from 'react';
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { useMedicationContext } from '../../context/MedicationContext';
import { useInteractionCheck } from '../../hooks/useMedications';
import InteractionCard from './InteractionCard';

export default function InteractionResults() {
  const { medications, getMedicationsForInteractionCheck } = useMedicationContext();
  const { interactions, isChecking, error, checkInteractions } = useInteractionCheck();

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

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">
          Interactions
        </h2>
        
        {!isChecking && (
          <div className="flex items-center space-x-2">
            {hasInteractions ? (
              severityStats.major > 0 ? (
                <AlertTriangle className="w-4 h-4 text-red-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )
            ) : (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            <span className={`text-sm ${
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
      </div>

      {/* Loading State */}
      {isChecking && (
        <div className="text-center py-8">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Checking interactions...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isChecking && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* No Interactions */}
      {!isChecking && !error && !hasInteractions && (
        <div className="text-center py-8">
          <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-1">
            No interactions detected
          </h3>
          <p className="text-sm text-gray-500">
            Your medications appear safe to take together
          </p>
        </div>
      )}

      {/* Interactions Found */}
      {!isChecking && !error && hasInteractions && (
        <div className="space-y-3">
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
    </div>
  );
}