// src/hooks/useMedications.js - Updated with hybrid search
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rxnormAPI } from '../services/rxnorm';
import { indianMedicineAPI } from '../services/indianMedicine';
import { useDebounce } from './useDebounce';

export function useMedicationSearch(searchTerm) {
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  return useQuery({
    queryKey: ['medication-search', debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        return [];
      }

      const results = [];

      // 1. Search Indian medicines first (instant, local)
      if (indianMedicineAPI.isLoaded()) {
        const indianResults = indianMedicineAPI.searchMedicines(debouncedSearchTerm, 8);
        results.push(...indianResults);
      }

      // 2. Search RxNorm for US/international medicines (if we need more results)
      if (results.length < 5) {
        try {
          const rxnormResults = await rxnormAPI.searchDrugs(debouncedSearchTerm);
          // Add non-duplicate results
          const newResults = rxnormResults.filter(rx => 
            !results.some(indian => 
              indian.name?.toLowerCase() === rx.name?.toLowerCase()
            )
          );
          results.push(...newResults.slice(0, 5 - results.length));
        } catch (error) {
          console.warn('RxNorm search failed:', error);
        }
      }

      return results.slice(0, 10); // Limit total results
    },
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
}

export function useMedications() {
  const [medications, setMedications] = useState([]);

  const addMedication = useCallback((medication) => {
    setMedications(prev => {
      // Check if medication already exists (handle both Indian and US meds)
      const exists = prev.some(med => 
        med.rxcui === medication.rxcui || 
        (med.id && medication.id && med.id === medication.id)
      );
      
      if (exists) return prev;
      
      return [...prev, {
        ...medication,
        id: medication.id || Date.now() + Math.random(),
        addedAt: new Date().toISOString()
      }];
    });
  }, []);

  const removeMedication = useCallback((medicationId) => {
    setMedications(prev => prev.filter(med => 
      med.id !== medicationId && med.rxcui !== medicationId
    ));
  }, []);

  const clearAllMedications = useCallback(() => {
    setMedications([]);
  }, []);

  // New function: Get medications ready for interaction checking
  const getMedicationsForInteractionCheck = useCallback(() => {
    return medications.map(med => ({
      ...med,
      // Determine the best identifier for interaction checking
      interactionId: med.isIndianMedicine ? med.genericName : med.rxcui,
      interactionName: med.isIndianMedicine ? med.genericName : med.name,
      canCheckInteractions: med.isIndianMedicine ? !!med.genericName : !!med.rxcui
    }));
  }, [medications]);

  return {
    medications,
    addMedication,
    removeMedication,
    clearAllMedications,
    medicationCount: medications.length,
    getMedicationsForInteractionCheck
  };
}

// New hook for interaction checking using OpenFDA
export function useInteractionCheck() {
  const [isChecking, setIsChecking] = useState(false);
  const [interactions, setInteractions] = useState([]);
  const [error, setError] = useState(null);

  const checkInteractions = useCallback(async (medications) => {
    if (medications.length < 2) {
      setInteractions([]);
      return;
    }

    setIsChecking(true);
    setError(null);
    
    try {
      // Import the OpenFDA service
      const { openFDAInteractionService } = await import('../services/openfdaInteractions');
      
      // Check interactions using OpenFDA adverse events analysis
      const result = await openFDAInteractionService.checkMultipleDrugInteractions(medications);
      
      // Convert OpenFDA results to match existing InteractionCard format
      const formattedInteractions = result.interactions.map(interaction => ({
        medication1: interaction.medication1,
        medication2: interaction.medication2,
        interactions: interaction.interaction.interactions.map(reaction => ({
          severity: reaction.severity,
          description: reaction.description,
          source: 'OpenFDA Adverse Events Analysis',
          methodology: 'Adverse event co-occurrence analysis',
          confidence: interaction.interaction.confidence,
          reportCount: interaction.interaction.reportCount,
          reactionName: reaction.reaction,
          elevationFactor: reaction.elevationFactor
        })),
        pairId: interaction.pairId
      }));
      
      setInteractions(formattedInteractions);
    } catch (error) {
      setError(`Interaction analysis failed: ${error.message}`);
      console.error('OpenFDA interaction check error:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    interactions,
    isChecking,
    error,
    checkInteractions
  };
}