import React, { createContext, useContext } from 'react';
import { useMedications } from '../hooks/useMedications';

const MedicationContext = createContext();

export function MedicationProvider({ children }) {
  const medicationState = useMedications();
  
  return (
    <MedicationContext.Provider value={medicationState}>
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