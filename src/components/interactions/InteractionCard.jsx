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
      case 'major': return 'text-red-600 bg-red-50 border-red-200';
      case 'moderate': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatMedicationName = (medication) => {
    return medication.name || medication.synonym || 'Unknown medication';
  };

  const formatDescription = (description) => {
    if (!description) return 'No detailed information available.';
    return description.replace(/^\w+:\s*/, '').replace(/\s+/g, ' ').trim();
  };

  const getActionableAdvice = (severity) => {
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
    <div className={`border rounded-lg overflow-hidden transition-colors ${getSeverityColor(severity)}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 text-left hover:bg-opacity-80 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                severity === 'major' ? 'bg-red-100 text-red-700' :
                severity === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {severity.charAt(0).toUpperCase() + severity.slice(1)}
              </span>
              {interactions.length > 1 && (
                <span className="text-xs text-gray-500">
                  {interactions.length} interactions
                </span>
              )}
            </div>
            
            <div className="text-sm font-medium text-gray-900 mb-1">
              {formatMedicationName(medication1)} + {formatMedicationName(medication2)}
            </div>
            
            <p className="text-sm text-gray-600">
              {interactions.length > 1 
                ? `Multiple interactions detected including ${interactions[0].reactionName || 'adverse events'}`
                : formatDescription(interactions[0].description).substring(0, 80) + '...'
              }
            </p>
          </div>
          
          <div className="flex-shrink-0 ml-3">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-white border-opacity-50">
          <div className="space-y-4 pt-4">
            
            {/* Interactions */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Details
              </h4>
              <div className="space-y-3">
                {interactions.map((interaction, idx) => (
                  <div key={idx} className="bg-white bg-opacity-60 p-3 rounded-lg">
                    {interaction.reactionName && (
                      <h5 className="text-sm font-medium text-gray-900 mb-1">
                        {interaction.reactionName}
                      </h5>
                    )}
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {formatDescription(interaction.description)}
                    </p>
                    
                    {(interaction.reportCount || interaction.confidence) && (
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        {interaction.reportCount && (
                          <p>Based on {interaction.reportCount} reports</p>
                        )}
                        {interaction.confidence && (
                          <p>Confidence: {interaction.confidence}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                What to do
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed bg-white bg-opacity-60 p-3 rounded-lg">
                {getActionableAdvice(severity)}
              </p>
            </div>

            {/* Source */}
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-white border-opacity-30">
              Source: {interactions[0]?.source || 'FDA Adverse Events Analysis'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}