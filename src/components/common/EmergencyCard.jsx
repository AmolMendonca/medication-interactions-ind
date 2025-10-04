import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle, Printer } from 'lucide-react';
import { useMedicationContext } from '../../context/MedicationContext';

export default function EmergencyCard({ isOpen, onClose }) {
  const { medications, interactions } = useMedicationContext();
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [dragOffset, setDragOffset] = useState(0);
  const cardRef = useRef(null);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Lock to portrait on mobile if possible
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock('portrait').catch(() => {});
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Swipe to dismiss functionality
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
    const distance = e.targetTouches[0].clientY - touchStart;
    if (distance > 0) {
      setDragOffset(distance);
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchEnd - touchStart;
    if (distance > minSwipeDistance) {
      onClose();
    }
    setDragOffset(0);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Get major interactions only
  const getMajorInteractions = () => {
    const majorInteractions = [];
    interactions.forEach(pair => {
      pair.interactions.forEach(interaction => {
        const severity = interaction.severity?.toLowerCase() || '';
        if (severity.includes('major') || severity.includes('severe')) {
          majorInteractions.push({
            drugs: `${pair.medication1.name} + ${pair.medication2.name}`,
            description: interaction.description
          });
        }
      });
    });
    return majorInteractions;
  };

  const majorInteractions = getMajorInteractions();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black animate-fade-in"
      style={{ 
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {/* Handle bar */}
      <div 
        className="absolute top-0 left-0 right-0 h-24 flex items-start justify-center pt-3 cursor-grab active:cursor-grabbing z-10 no-print"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="w-12 h-1.5 bg-white/40 rounded-full" />
      </div>

      {/* Action buttons */}
      <div className="absolute top-14 right-4 z-20 flex items-center space-x-2 no-print">
        {/* Print button */}
        <button
          onClick={() => window.print()}
          className="w-11 h-11 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-full flex items-center justify-center transition-all active:scale-95"
          aria-label="Print emergency card"
        >
          <Printer className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="w-11 h-11 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-full flex items-center justify-center transition-all active:scale-95"
          aria-label="Close emergency card"
        >
          <X className="w-6 h-6 text-white" strokeWidth={3} />
        </button>
      </div>

      {/* Scrollable Content */}
      <div 
        ref={cardRef}
        className="h-full overflow-y-auto overscroll-contain"
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: dragOffset === 0 ? 'transform 0.2s ease-out' : 'none'
        }}
      >
        <div className="min-h-full px-6 pt-24 pb-12">
          
          {/* Emergency Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-4">
              <AlertCircle className="w-11 h-11 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-white text-4xl font-bold tracking-tight mb-2 leading-tight">
              Emergency Medical Card
            </h1>
            <p className="text-red-200 text-lg font-medium">
              For Emergency Personnel Only
            </p>
          </div>

          {/* Alert Banner */}
          {majorInteractions.length > 0 && (
            <div className="mb-6 bg-red-600/90 backdrop-blur-sm rounded-3xl p-5 border-2 border-red-400 print-avoid-break">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-7 h-7 text-white flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <div>
                  <h3 className="text-white text-xl font-bold mb-1">
                    Critical Drug Interactions
                  </h3>
                  <p className="text-red-100 text-base font-medium">
                    {majorInteractions.length} major interaction{majorInteractions.length !== 1 ? 's' : ''} detected
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Medications Section */}
          <div className="mb-6">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden print-avoid-break">
              {/* Section Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <h2 className="text-white text-2xl font-bold tracking-tight">
                  Current Medications
                </h2>
                <p className="text-red-50 text-sm font-medium mt-0.5">
                  As of {currentDate}
                </p>
              </div>

              {/* Medication List */}
              <div className="divide-y divide-gray-200">
                {medications.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-gray-600 text-lg font-medium">
                      No medications recorded
                    </p>
                  </div>
                ) : (
                  medications.map((med, index) => (
                    <div key={med.id || index} className="px-6 py-5 print-avoid-break">
                      {/* Medication Number Badge */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {index + 1}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {/* Drug Name */}
                          <h3 className="text-gray-900 text-2xl font-bold tracking-tight leading-tight mb-1">
                            {med.name}
                          </h3>
                          
                          {/* Generic Name */}
                          {med.genericName && med.genericName !== med.name && (
                            <p className="text-gray-600 text-base font-semibold mb-2">
                              Generic: {med.genericName}
                            </p>
                          )}
                          
                          {/* Dosage & Additional Info */}
                          <div className="space-y-1.5 mt-3">
                            {med.dosage && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                <p className="text-gray-700 text-base font-medium">
                                  Dosage: {med.dosage}
                                </p>
                              </div>
                            )}
                            {med.manufacturer_name && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                <p className="text-gray-700 text-base font-medium">
                                  Manufacturer: {med.manufacturer_name}
                                </p>
                              </div>
                            )}
                            {med.source && (
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full" />
                                <p className="text-gray-600 text-sm font-medium capitalize">
                                  Source: {med.source}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Major Interactions Section */}
          {majorInteractions.length > 0 && (
            <div className="mb-6">
              <div className="bg-white/95 backdrop-blur-xl rounded-3xl overflow-hidden border-3 border-red-500 print-avoid-break">
                {/* Section Header */}
                <div className="bg-red-600 px-6 py-4">
                  <h2 className="text-white text-2xl font-bold tracking-tight">
                    ⚠️ Critical Interactions
                  </h2>
                  <p className="text-red-100 text-sm font-medium mt-0.5">
                    Requires immediate attention
                  </p>
                </div>

                {/* Interactions List */}
                <div className="divide-y divide-red-200">
                  {majorInteractions.map((interaction, index) => (
                    <div key={index} className="px-6 py-5 bg-red-50/50 print-avoid-break">
                      <div className="flex items-start space-x-3 mb-2">
                        <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center mt-1">
                          <AlertCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-gray-900 text-xl font-bold leading-tight mb-2">
                            {interaction.drugs}
                          </h3>
                          <p className="text-gray-700 text-base font-medium leading-relaxed">
                            {interaction.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Emergency Instructions */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 mb-6 print-avoid-break">
            <h2 className="text-gray-900 text-xl font-bold mb-4">
              For Healthcare Providers
            </h2>
            <div className="space-y-3 text-gray-700 text-base leading-relaxed">
              <p className="font-medium">
                • This card shows all medications currently taken by the patient
              </p>
              <p className="font-medium">
                • Major drug interactions are highlighted above
              </p>
              <p className="font-medium">
                • Verify all medications before administering new drugs
              </p>
              <p className="font-medium">
                • Contact patient's primary physician if possible
              </p>
            </div>
          </div>

          {/* App Info Footer */}
          <div className="text-center pt-4 pb-safe">
            <p className="text-white/60 text-sm font-medium mb-2">
              Generated by MedSure Drug Interaction Checker
            </p>
            <p className="text-white/40 text-xs font-medium">
              Last updated: {currentDate}
            </p>
            <p className="text-white/40 text-xs font-medium mt-1">
              This is not a substitute for professional medical records
            </p>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        /* Print Styles - Optimized for Emergency Responders */
        @media print {
          /* Hide interactive elements */
          button, .no-print {
            display: none !important;
          }
          
          /* Optimize layout for printing */
          body {
            background: white !important;
          }
          
          /* Ensure black text on white background for readability */
          * {
            color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Break pages appropriately */
          .print-avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          /* Ensure critical info is visible */
          .bg-red-500, .bg-red-600 {
            background-color: #ef4444 !important;
            color: white !important;
          }
          
          /* High contrast for emergency info */
          h1, h2, h3 {
            color: black !important;
          }
          
          /* Remove shadows and decorative elements */
          .shadow-lg, .shadow-xl, .shadow-2xl {
            box-shadow: none !important;
          }
        }
        
        /* Safe area support for iOS */
        .safe-area-top {
          padding-top: env(safe-area-inset-top);
        }
        
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        /* Smooth scrolling */
        .overflow-y-auto {
          -webkit-overflow-scrolling: touch;
        }
        
        /* Prevent text selection during swipe */
        .cursor-grab:active {
          cursor: grabbing;
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>
    </div>
  );
}

