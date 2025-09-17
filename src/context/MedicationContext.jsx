// src/context/MedicationContext.jsx - Updated with Supabase
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { medicationsDB } from '../lib/supabase';

const MedicationContext = createContext();

export function MedicationProvider({ children }) {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Load medications when user signs in
  useEffect(() => {
    if (user) {
      loadMedications();
    } else {
      // Clear medications when user signs out
      setMedications([]);
      setError(null);
    }
  }, [user]);

  const loadMedications = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const userMedications = await medicationsDB.getUserMedications();
      setMedications(userMedications);
    } catch (err) {
      console.error('Failed to load medications:', err);
      setError('Failed to load your medications');
    } finally {
      setLoading(false);
    }
  };

  const addMedication = useCallback(async (medication) => {
    if (!user) {
      setError('Please sign in to add medications');
      return;
    }

    // Check if medication already exists
    const exists = medications.some(med => 
      med.rxcui === medication.rxcui || 
      (med.id && medication.id && med.id === medication.id)
    );
    
    if (exists) return;

    setLoading(true);
    setError(null);

    try {
      // Add to database
      const medicationToAdd = {
        ...medication,
        id: medication.id || Date.now() + Math.random(),
        addedAt: new Date().toISOString()
      };

      const savedMedication = await medicationsDB.addMedication(medicationToAdd);
      
      // Update local state
      setMedications(prev => [...prev, savedMedication]);
    } catch (err) {
      console.error('Failed to add medication:', err);
      setError('Failed to add medication');
    } finally {
      setLoading(false);
    }
  }, [user, medications]);

  const removeMedication = useCallback(async (medicationId) => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Find the medication to get its dbId
      const medication = medications.find(med => 
        med.id === medicationId || med.rxcui === medicationId
      );

      if (!medication) {
        setError('Medication not found');
        return;
      }

      // Remove from database using dbId
      await medicationsDB.removeMedication(medication.dbId);
      
      // Update local state
      setMedications(prev => prev.filter(med => 
        med.id !== medicationId && med.rxcui !== medicationId
      ));
    } catch (err) {
      console.error('Failed to remove medication:', err);
      setError('Failed to remove medication');
    } finally {
      setLoading(false);
    }
  }, [user, medications]);

  const clearAllMedications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      // Clear from database
      await medicationsDB.clearAllMedications();
      
      // Update local state
      setMedications([]);
    } catch (err) {
      console.error('Failed to clear medications:', err);
      setError('Failed to clear medications');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get medications ready for interaction checking
  const getMedicationsForInteractionCheck = useCallback(() => {
    return medications.map(med => ({
      ...med,
      interactionId: med.isIndianMedicine ? med.genericName : med.rxcui,
      interactionName: med.isIndianMedicine ? med.genericName : med.name,
      canCheckInteractions: med.isIndianMedicine ? !!med.genericName : !!med.rxcui
    }));
  }, [medications]);

  const value = {
    medications,
    loading,
    error,
    addMedication,
    removeMedication,
    clearAllMedications,
    getMedicationsForInteractionCheck,
    medicationCount: medications.length,
    refreshMedications: loadMedications
  };

  return (
    <MedicationContext.Provider value={value}>
      {children}
    </MedicationContext.Provider>
  );
}

export function useMedicationContext() {
  const context = useContext(MedicationContext);
  if (!context) {
    throw new Error('useMedicationContext must be used within a MedicationProvider');
  }
  return context;
}