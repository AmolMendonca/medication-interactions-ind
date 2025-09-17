import React, { useEffect } from 'react';
import { AlertTriangle, Shield, AlertCircle, Loader2, CheckCircle2, Info } from 'lucide-react';
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
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${hasInteractions && !isChecking 
                ? severityStats.major > 0 
                  ? 'bg-red-100' 
                  : severityStats.moderate > 0 
                    ? 'bg-yellow-100' 
                    : 'bg-blue-100'
                : 'bg-gray-100'
              }
            `}>
              {isChecking ? (
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              ) : hasInteractions ? (
                severityStats.major > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                ) : severityStats.moderate > 0 ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <Info className="w-5 h-5 text-blue-600" />
                )
              ) : (
                <Shield className="w-5 h-5 text-green-600" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Drug Interaction Analysis
              </h3>
              <p className="text-sm text-gray-500">
                {isChecking 
                  ? 'Analyzing your medications...'
                  : `Checked ${medications.length} medications`
                }
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          {!isChecking && (
            <div className={`
              px-3 py-1 rounded-full text-xs font-medium
              ${hasInteractions 
                ? severityStats.major > 0
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : severityStats.moderate > 0
                    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-green-100 text-green-800 border border-green-200'
              }
            `}>
              {hasInteractions 
                ? `${severityStats.total} interaction${severityStats.total !== 1 ? 's' : ''} found`
                : 'No interactions found'
              }
            </div>
          )}
        </div>

        {/* Loading State */}
        {isChecking && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Checking for drug interactions...</p>
            <p className="text-sm text-gray-500">
              Analyzing {medications.length} medications using medical databases
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isChecking && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  Unable to Check Interactions
                </h4>
                <p className="text-sm text-red-700">{error}</p>
                <button 
                  onClick={() => checkInteractions(getMedicationsForInteractionCheck())}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Interactions Found */}
        {!isChecking && !error && !hasInteractions && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No Interactions Detected
            </h4>
            <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
              Based on available data, we found no significant drug interactions between your medications.
            </p>
            
            {/* Safety Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-900 mb-1">Important Note</p>
                  <p className="text-sm text-blue-800">
                    This analysis covers major known interactions. Always consult your healthcare provider 
                    before making changes to your medications.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Interaction Results */}
        {!isChecking && !error && hasInteractions && (
          <div className="space-y-6">
            {/* Summary Stats */}
            {severityStats.total > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {severityStats.major > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-red-700">{severityStats.major}</div>
                    <div className="text-sm text-red-600">Major</div>
                  </div>
                )}
                {severityStats.moderate > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-yellow-700">{severityStats.moderate}</div>
                    <div className="text-sm text-yellow-600">Moderate</div>
                  </div>
                )}
                {severityStats.minor > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-700">{severityStats.minor}</div>
                    <div className="text-sm text-blue-600">Minor</div>
                  </div>
                )}
              </div>
            )}

            {/* Interaction Cards */}
            <div className="space-y-4">
              {interactions.map((interactionPair, index) => (
                <InteractionCard
                  key={interactionPair.pairId || index}
                  medication1={interactionPair.medication1}
                  medication2={interactionPair.medication2}
                  interactions={interactionPair.interactions} // Pass all interactions for this pair
                />
              ))}
            </div>

            {/* Medical Disclaimer */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">Medical Disclaimer</p>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    This information is for educational purposes only and should not replace professional medical advice. 
                    Contact your healthcare provider immediately if you have concerns about drug interactions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}