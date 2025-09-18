// src/hooks/usePDFExport.js
import { useState, useCallback } from 'react';
import { pdfExportService } from '../services/pdfExportService';

export function usePDFExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const exportInteractionReport = useCallback(async (medications, interactions, patientInfo = {}) => {
    setIsExporting(true);
    setExportError(null);

    try {
      const result = await pdfExportService.exportToPDF(medications, interactions, patientInfo);
      
      if (result.success) {
        return { success: true, filename: result.filename };
      } else {
        setExportError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      const errorMessage = 'Failed to generate PDF report. Please try again.';
      setExportError(errorMessage);
      console.error('PDF export error:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsExporting(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setExportError(null);
  }, []);

  return {
    exportInteractionReport,
    isExporting,
    exportError,
    clearError
  };
}
