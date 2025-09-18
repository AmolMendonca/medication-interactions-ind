import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

export default function InteractionCard({ medication1, medication2, interactions }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine overall severity from all interactions
  const getOverallSeverity = (interactions) => {
    const severities = interactions.map(i => i.severity?.toLowerCase() || 'minor');
    
    if (severities.some(s => s.includes('major') || s.includes('severe') || s.includes('high'))) {
      return 'major';
    } else if (severities.some(s => s.includes('moderate') || s.includes('medium'))) {
      return 'moderate';
    }
    return 'minor';
  };

  const severity = getOverallSeverity(interactions);
  
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'major': return 'bg-red-50/80 border-red-200/60';
      case 'moderate': return 'bg-yellow-50/80 border-yellow-200/60';
      default: return 'bg-blue-50/80 border-blue-200/60';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'major': return 'bg-red-500 text-white';
      case 'moderate': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const formatMedicationName = (medication) => {
    return medication.name || medication.synonym || 'Unknown medication';
  };

  const formatDescription = (description) => {
    if (!description) return 'No detailed information available.';
    return description.replace(/^\w+:\s*/, '').replace(/\s+/g, ' ').trim();
  };

  const getActionableAdvice = (severity, interactions) => {
    // Use specific recommendation from known interactions if available
    const knownRecommendation = interactions.find(int => int.recommendation)?.recommendation;
    if (knownRecommendation) {
      return knownRecommendation;
    }

    // Fall back to generic advice based on severity
    switch (severity) {
      case 'major':
        return 'Contact your healthcare provider immediately. This combination may require medical supervision.';
      case 'moderate':
        return 'Monitor for side effects and discuss with your healthcare provider.';
      default:
        return 'Be aware of potential minor interactions and inform your healthcare provider.';
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm border rounded-[20px] overflow-hidden transition-all duration-200 ${getSeverityColor(severity)}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-white/40 active:bg-white/60 transition-all duration-150"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`text-[12px] font-semibold px-2 py-1 rounded-full ${getSeverityBadgeColor(severity)}`}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </span>
              {interactions.length > 1 && (
                <span className="text-[12px] text-gray-500 font-medium">
                  {interactions.length} interactions
                </span>
              )}
            </div>
            
            <div className="text-[16px] font-semibold text-gray-900 mb-1 leading-[20px]">
              {formatMedicationName(medication1)} + {formatMedicationName(medication2)}
            </div>
            
            <p className="text-[14px] text-gray-600 leading-[18px]">
              {interactions.length > 1 
                ? `Multiple interactions detected including ${interactions[0].reactionName || 'adverse events'}`
                : formatDescription(interactions[0].description).substring(0, 80) + '...'
              }
            </p>
          </div>
          
          <div className="flex-shrink-0 ml-3">
            <div className="w-8 h-8 bg-gray-100/60 rounded-full flex items-center justify-center">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </div>
        </div>
      </button>

      {/* iOS-style Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200/40">
          <div className="space-y-5 pt-4">
            
            {/* Interactions Details */}
            <div>
              <h4 className="text-[16px] font-semibold text-gray-900 mb-3 tracking-tight">
                Details
              </h4>
              <div className="space-y-3">
                {interactions.map((interaction, idx) => (
                  <div key={idx} className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100/60">
                    {interaction.reactionName && (
                      <h5 className="text-[15px] font-semibold text-gray-900 mb-2 leading-[18px]">
                        {interaction.reactionName}
                      </h5>
                    )}
                    <p className="text-[14px] text-gray-700 leading-[20px] mb-3">
                      {formatDescription(interaction.description)}
                    </p>

                    {/* Clinical Effects */}
                    {interaction.clinicalEffects && interaction.clinicalEffects.length > 0 && (
                      <div className="mt-4">
                        <h6 className="text-[13px] font-semibold text-gray-800 mb-2">Clinical Effects:</h6>
                        <ul className="text-[13px] text-gray-600 space-y-1.5">
                          {interaction.clinicalEffects.map((effect, idx) => (
                            <li key={idx} className="flex items-start">
                              <span className="text-red-500 mr-2 mt-0.5">•</span>
                              <span className="leading-[16px]">{effect}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Monitoring Requirements */}
                    {interaction.monitoring && (
                      <div className="mt-4 p-3 bg-yellow-50/80 rounded-xl border border-yellow-200/60">
                        <h6 className="text-[13px] font-semibold text-yellow-800 mb-1">Monitoring Required:</h6>
                        <p className="text-[13px] text-yellow-700 leading-[16px]">{interaction.monitoring}</p>
                      </div>
                    )}

                    {/* Evidence Details */}
                    {(interaction.reportCount || interaction.confidence || interaction.mechanism) && (
                      <div className="mt-3 text-[12px] text-gray-500 space-y-1">
                        {interaction.mechanism && (
                          <p><span className="font-medium">Mechanism:</span> {interaction.mechanism}</p>
                        )}
                        {interaction.reportCount && (
                          <p>Based on {interaction.reportCount} adverse event reports</p>
                        )}
                        {interaction.confidence && (
                          <p>Confidence: {interaction.confidence}</p>
                        )}
                        {interaction.evidenceLevel && (
                          <p>Evidence: {interaction.evidenceLevel.replace('_', ' ')}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* What to do */}
            <div>
              <h4 className="text-[16px] font-semibold text-gray-900 mb-3 tracking-tight">
                What to do
              </h4>
              <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100/60">
                <p className="text-[14px] text-gray-700 leading-[20px]">
                  {getActionableAdvice(severity, interactions)}
                </p>
              </div>
            </div>

            {/* Source */}
            <div className="text-center pt-2">
              <p className="text-[12px] text-gray-400 font-medium">
                Source: {interactions[0]?.source || 'OpenFDA Adverse Events Analysis'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}