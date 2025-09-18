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

      // 1. Search Indian medicines first (but limit to 5 to leave room for international)
      if (indianMedicineAPI.isLoaded()) {
        const indianResults = indianMedicineAPI.searchMedicines(debouncedSearchTerm, 5);
        results.push(...indianResults);
      }

      // 2. Always search RxNorm for US/international medicines 
      try {
        const rxnormResults = await rxnormAPI.searchDrugs(debouncedSearchTerm);
        // Add all RxNorm results (they're already limited to 10 in the service)
        results.push(...rxnormResults);
      } catch (error) {
        console.warn('RxNorm search failed:', error);
      }

      // 3. Remove duplicates based on similar names but keep both Indian and international versions
      const uniqueResults = results.filter((item, index, arr) => {
        // Keep if it's the first occurrence or if names are not too similar
        const firstIndex = arr.findIndex(other => 
          other.name?.toLowerCase().replace(/[^a-z]/g, '') === 
          item.name?.toLowerCase().replace(/[^a-z]/g, '')
        );
        return index === firstIndex;
      });

      return uniqueResults.slice(0, 15); // Increased limit to show more options
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
      // Import the hybrid interaction service
      const { hybridInteractionService } = await import('../services/hybridInteractionService');
      
      // Check interactions using comprehensive multi-source analysis
      const result = await hybridInteractionService.checkMultipleDrugInteractions(medications);
      
      // Convert results to match existing InteractionCard format
      const formattedInteractions = result.interactions.map(interactionPair => ({
        medication1: interactionPair.medication1,
        medication2: interactionPair.medication2,
        interactions: interactionPair.interactions.map(interaction => ({
          severity: interaction.severity,
          description: interaction.description,
          source: interaction.source,
          methodology: interaction.methodology,
          confidence: interaction.confidence,
          reportCount: interaction.reportCount,
          reactionName: interaction.reactionName,
          elevationFactor: interaction.elevationFactor,
          mechanism: interaction.mechanism,
          clinicalEffects: interaction.clinicalEffects,
          monitoring: interaction.monitoring,
          recommendation: interaction.recommendation,
          evidenceLevel: interaction.evidenceLevel
        })),
        pairId: interactionPair.pairId,
        overallSeverity: interactionPair.severity,
        confidence: interactionPair.confidence,
        sources: interactionPair.sources,
        safeCombination: interactionPair.safeCombination // Include safe combination info
      }));
      
      setInteractions(formattedInteractions);
    } catch (error) {
      setError(`Interaction analysis failed: ${error.message}`);
      console.error('Hybrid interaction check error:', error);
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