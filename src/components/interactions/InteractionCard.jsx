import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp, Pill } from 'lucide-react';

export default function InteractionCard({ medication1, medication2, interactions }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine overall severity from all interactions
  const getOverallSeverity = (interactions) => {
    const severities = interactions.map(i => i.severity?.toLowerCase() || 'minor');
    
    if (severities.some(s => s.includes('major') || s.includes('severe') || s.includes('high'))) {
      return {
        level: 'major',
        color: 'red',
        icon: AlertTriangle,
        label: 'Major',
        bgClass: 'bg-red-50 border-red-200',
        textClass: 'text-red-800',
        iconClass: 'text-red-600',
        badgeClass: 'bg-red-100 text-red-800'
      };
    } else if (severities.some(s => s.includes('moderate') || s.includes('medium'))) {
      return {
        level: 'moderate',
        color: 'yellow',
        icon: AlertCircle,
        label: 'Moderate',
        bgClass: 'bg-yellow-50 border-yellow-200',
        textClass: 'text-yellow-800',
        iconClass: 'text-yellow-600',
        badgeClass: 'bg-yellow-100 text-yellow-800'
      };
    } else {
      return {
        level: 'minor',
        color: 'blue',
        icon: Info,
        label: 'Minor',
        bgClass: 'bg-blue-50 border-blue-200',
        textClass: 'text-blue-800',
        iconClass: 'text-blue-600',
        badgeClass: 'bg-blue-100 text-blue-800'
      };
    }
  };

  const severityInfo = getOverallSeverity(interactions);
  const SeverityIcon = severityInfo.icon;

  const formatMedicationName = (medication) => {
    return medication.name || medication.synonym || 'Unknown medication';
  };

  const getDisplayName = (medication) => {
    if (medication.isIndianMedicine) {
      return formatMedicationName(medication);
    }
    return formatMedicationName(medication);
  };

  const getGenericName = (medication) => {
    if (medication.isIndianMedicine && medication.genericName) {
      return medication.genericName;
    }
    return medication.interactionName || medication.name;
  };

  const formatDescription = (description) => {
    if (!description) return 'No detailed information available.';
    
    // Clean up common formatting issues
    return description
      .replace(/^\w+:\s*/, '') // Remove "DrugBank: " prefix
      .replace(/\s+/g, ' ')    // Clean up whitespace
      .trim();
  };

  const getActionableAdvice = (severity) => {
    const sev = severity?.toLowerCase() || 'minor';
    
    if (sev.includes('major') || sev.includes('severe')) {
      return 'Contact your healthcare provider immediately. This combination may require dosage adjustments or alternative medications.';
    } else if (sev.includes('moderate')) {
      return 'Monitor for side effects and discuss with your healthcare provider at your next appointment.';
    } else {
      return 'Be aware of potential minor interactions. Inform your healthcare provider about all medications you are taking.';
    }
  };

  return (
    <div className={`
      border rounded-xl overflow-hidden transition-all duration-200
      ${severityInfo.bgClass}
      ${isExpanded ? 'shadow-sm' : 'hover:shadow-sm'}
    `}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {/* Severity Icon */}
            <div className={`
              flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-1
              bg-white shadow-sm
            `}>
              <SeverityIcon className={`w-4 h-4 ${severityInfo.iconClass}`} />
            </div>
            
            {/* Interaction Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className={`
                  inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${severityInfo.badgeClass}
                `}>
                  {severityInfo.label} Interaction{interactions.length > 1 ? 's' : ''}
                </span>
                {interactions.length > 1 && (
                  <span className="text-xs text-gray-500">
                    {interactions.length} interactions
                  </span>
                )}
              </div>
              
              {/* Medication Pair */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Pill className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {getDisplayName(medication1)}
                  </span>
                  {medication1.isIndianMedicine && medication1.genericName && (
                    <span className="text-xs text-gray-500">
                      ({medication1.genericName})
                    </span>
                  )}
                </div>
                
                <span className="text-gray-400 text-sm">+</span>
                
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm">
                    <Pill className="w-3 h-3 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {getDisplayName(medication2)}
                  </span>
                  {medication2.isIndianMedicine && medication2.genericName && (
                    <span className="text-xs text-gray-500">
                      ({medication2.genericName})
                    </span>
                  )}
                </div>
              </div>
              
              {/* Brief Description - Show summary of all interactions */}
              <div className={`text-sm ${severityInfo.textClass} leading-relaxed`}>
                {isExpanded ? (
                  <div className="space-y-2">
                    {interactions.map((interaction, idx) => (
                      <div key={idx}>
                        <span className="font-medium">{interaction.reactionName || 'Interaction'}:</span>{' '}
                        {formatDescription(interaction.description)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>
                    {interactions.length > 1 
                      ? `${interactions.length} potential interactions detected including ${interactions[0].reactionName || 'adverse events'}`
                      : formatDescription(interactions[0].description)
                    }
                    {interactions.length > 1 && '...'}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {/* Expand Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              flex-shrink-0 p-1 rounded-lg transition-colors ml-2
              hover:bg-white hover:shadow-sm
              ${severityInfo.textClass}
            `}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white border-opacity-50">
            <div className="space-y-4">
              
              {/* All Interactions Details */}
              <div>
                <h5 className={`text-sm font-semibold ${severityInfo.textClass} mb-3`}>
                  Interaction Details ({interactions.length} interaction{interactions.length > 1 ? 's' : ''})
                </h5>
                <div className="space-y-3">
                  {interactions.map((interaction, idx) => (
                    <div key={idx} className={`${severityInfo.textClass} bg-white bg-opacity-50 p-3 rounded-lg`}>
                      <h6 className="text-sm font-medium mb-1">
                        {interaction.reactionName || `Interaction ${idx + 1}`}
                      </h6>
                      <p className="text-sm leading-relaxed mb-2">
                        {formatDescription(interaction.description)}
                      </p>
                      
                      {/* OpenFDA specific information */}
                      <div className="text-xs opacity-75 space-y-1">
                        {interaction.reportCount && (
                          <p>Based on {interaction.reportCount} adverse event reports</p>
                        )}
                        {interaction.elevationFactor && interaction.elevationFactor > 1 && (
                          <p>Risk elevated {interaction.elevationFactor.toFixed(1)}x compared to individual medications</p>
                        )}
                        {interaction.confidence && (
                          <p>Analysis confidence: {interaction.confidence}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Advice - Based on overall severity */}
              <div>
                <h5 className={`text-sm font-semibold ${severityInfo.textClass} mb-2`}>
                  Recommended Action
                </h5>
                <p className={`text-sm ${severityInfo.textClass} leading-relaxed bg-white bg-opacity-50 p-3 rounded-lg`}>
                  {getActionableAdvice(severityInfo.level)}
                </p>
              </div>

              {/* Data Source */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Source: {interactions[0].source || 'OpenFDA Adverse Events Analysis'}</span>
                <span>Methodology: {interactions[0].methodology || 'Adverse event co-occurrence analysis'}</span>
              </div>

              {/* Indian Medicine Notice */}
              {(medication1.isIndianMedicine || medication2.isIndianMedicine) && (
                <div className="bg-white bg-opacity-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        Indian Medication Analysis
                      </p>
                      <p className="text-xs text-blue-800 leading-relaxed">
                        This interaction analysis is based on the generic composition of Indian medications. 
                        Brand-specific formulations may have different interaction profiles.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}