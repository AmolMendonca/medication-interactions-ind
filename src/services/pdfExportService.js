// src/services/pdfExportService.js
import jsPDF from 'jspdf';

class PDFExportService {
  constructor() {
    this.pageWidth = 210; // A4 width in mm
    this.pageHeight = 297; // A4 height in mm
    this.margin = 20;
    this.contentWidth = this.pageWidth - (2 * this.margin);
  }

  async generateInteractionReport(medications, interactions, patientInfo = {}) {
    const pdf = new jsPDF();
    let currentY = this.margin;

    // Set up fonts
    pdf.setFont('helvetica');

    // Header
    currentY = this.addHeader(pdf, currentY);
    
    // Patient Information Section
    currentY = this.addPatientInfo(pdf, currentY, patientInfo);
    
    // Medications List
    currentY = this.addMedicationsList(pdf, currentY, medications);
    
    // Executive Summary
    currentY = this.addExecutiveSummary(pdf, currentY, interactions);
    
    // Detailed Interactions
    currentY = this.addDetailedInteractions(pdf, currentY, interactions);
    
    // Sources and Methodology
    currentY = this.addSourcesAndMethodology(pdf, currentY);
    
    // Footer with disclaimer
    this.addFooter(pdf);

    return pdf;
  }

  addHeader(pdf, currentY) {
    // Title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Drug Interaction Analysis Report', this.margin, currentY);
    currentY += 8;

    // Branding
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 120, 180); // Blue color for branding
    const brandingText = 'Powered by MedSure.info';
    const brandingWidth = pdf.getTextWidth(brandingText);
    pdf.text(brandingText, this.pageWidth - this.margin - brandingWidth, currentY);
    currentY += 8;

    // Subtitle
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 100, 100);
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    pdf.text(`Generated on ${generatedDate}`, this.margin, currentY);
    currentY += 15;

    // Reset text color
    pdf.setTextColor(0, 0, 0);
    
    return currentY;
  }

  addPatientInfo(pdf, currentY, patientInfo) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Information', this.margin, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    // Add patient fields if provided, otherwise placeholder text
    const fields = [
      { label: 'Name', value: patientInfo.name || '________________________' },
      { label: 'Date of Birth', value: patientInfo.dob || '________________________' },
      { label: 'Healthcare Provider', value: patientInfo.provider || '________________________' },
      { label: 'Report Date', value: new Date().toLocaleDateString() }
    ];

    fields.forEach(field => {
      pdf.text(`${field.label}: ${field.value}`, this.margin, currentY);
      currentY += 6;
    });

    currentY += 10;
    return currentY;
  }

  addMedicationsList(pdf, currentY, medications) {
    // Check if we need a new page
    const estimatedHeight = medications.length * 12 + 30; // Rough estimate
    if (currentY + estimatedHeight > this.pageHeight - 40) {
      pdf.addPage();
      currentY = this.margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Current Medications', this.margin, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    medications.forEach((med, index) => {
      // Check if we need a new page for this medication
      if (currentY > this.pageHeight - 50) {
        pdf.addPage();
        currentY = this.margin;
      }

      const medName = med.name || med.synonym || 'Unknown medication';
      const genericName = med.genericName && med.isIndianMedicine ? 
        ` (Generic: ${med.genericName})` : '';
      const source = med.isIndianMedicine ? 'Indian Medicine Database' : 'US Drug Database (RxNorm)';
      
      pdf.text(`${index + 1}. ${medName}${genericName}`, this.margin + 5, currentY);
      currentY += 5;
      pdf.setTextColor(100, 100, 100);
      pdf.text(`   Source: ${source}`, this.margin + 5, currentY);
      pdf.setTextColor(0, 0, 0);
      currentY += 7;
    });

    currentY += 10;
    return currentY;
  }

  addExecutiveSummary(pdf, currentY, interactions) {
    // Check if we need a new page
    if (currentY > this.pageHeight - 80) {
      pdf.addPage();
      currentY = this.margin;
    }

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Summary', this.margin, currentY);
    currentY += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    if (interactions.length === 0) {
      pdf.setTextColor(34, 139, 34); // Green
      pdf.text('✓ No significant drug interactions detected.', this.margin, currentY);
      pdf.setTextColor(0, 0, 0);
      currentY += 6;
      pdf.text('Your medications appear safe to take together based on current analysis.', this.margin, currentY);
      currentY += 15;
      return currentY;
    }

    // Calculate severity statistics
    const stats = this.calculateSeverityStats(interactions);
    
    // Overall risk assessment
    const riskLevel = stats.major > 0 ? 'HIGH' : stats.moderate > 0 ? 'MODERATE' : 'LOW';
    const riskColor = stats.major > 0 ? [220, 53, 69] : stats.moderate > 0 ? [255, 193, 7] : [40, 167, 69];
    
    pdf.setTextColor(...riskColor);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Overall Risk Level: ${riskLevel}`, this.margin, currentY);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    currentY += 8;

    // Summary statistics
    pdf.text(`Total Interactions Found: ${stats.total}`, this.margin, currentY);
    currentY += 6;
    if (stats.major > 0) {
      pdf.setTextColor(220, 53, 69);
      pdf.text(`• Major (High Risk): ${stats.major}`, this.margin + 10, currentY);
      pdf.setTextColor(0, 0, 0);
      currentY += 5;
    }
    if (stats.moderate > 0) {
      pdf.setTextColor(255, 193, 7);
      pdf.text(`• Moderate Risk: ${stats.moderate}`, this.margin + 10, currentY);
      pdf.setTextColor(0, 0, 0);
      currentY += 5;
    }
    if (stats.minor > 0) {
      pdf.setTextColor(23, 162, 184);
      pdf.text(`• Minor/Monitoring Required: ${stats.minor}`, this.margin + 10, currentY);
      pdf.setTextColor(0, 0, 0);
      currentY += 5;
    }

    currentY += 15;

    return currentY;
  }

  addDetailedInteractions(pdf, currentY, interactions) {
    if (interactions.length === 0) {
      return currentY;
    }

    // Always start detailed analysis on a new page
    pdf.addPage();
    currentY = this.margin;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Detailed Interaction Analysis', this.margin, currentY);
    currentY += 10;

    interactions.forEach((interactionPair, index) => {
      // Estimate space needed for this interaction (conservative estimate)
      const estimatedSpace = 40 + (interactionPair.interactions.length * 25);
      
      // Check if we need a new page
      if (currentY + estimatedSpace > this.pageHeight - 40) {
        pdf.addPage();
        currentY = this.margin;
      }

      currentY = this.addSingleInteraction(pdf, currentY, interactionPair, index + 1);
      currentY += 8; // Reduced spacing between interactions
    });

    return currentY;
  }

  addSingleInteraction(pdf, currentY, interactionPair, interactionNumber) {
    const med1Name = interactionPair.medication1.name || interactionPair.medication1.synonym;
    const med2Name = interactionPair.medication2.name || interactionPair.medication2.synonym;
    
    // Calculate overall severity
    const overallSeverity = this.getOverallSeverity(interactionPair.interactions);
    const severityColor = this.getSeverityColor(overallSeverity);

    // Interaction header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`${interactionNumber}. ${med1Name} + ${med2Name}`, this.margin, currentY);
    currentY += 6;

    // Severity badge
    pdf.setTextColor(...severityColor);
    pdf.setFontSize(10);
    pdf.text(`Severity: ${overallSeverity.toUpperCase()}`, this.margin, currentY);
    pdf.setTextColor(0, 0, 0);
    currentY += 8;

    // Individual reactions
    interactionPair.interactions.forEach((interaction, idx) => {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      if (interaction.reactionName) {
        pdf.text(`• ${interaction.reactionName}`, this.margin + 5, currentY);
        currentY += 5;
      }

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      
      // Description with word wrapping
      const description = this.formatDescription(interaction.description);
      const wrappedText = pdf.splitTextToSize(description, this.contentWidth - 10);
      
      // Check if description fits on current page
      if (currentY + (wrappedText.length * 4) > this.pageHeight - 40) {
        pdf.addPage();
        currentY = this.margin;
      }
      
      pdf.text(wrappedText, this.margin + 10, currentY);
      currentY += wrappedText.length * 4;

      // Evidence details
      if (interaction.reportCount || interaction.confidence) {
        // Check if evidence details fit
        if (currentY + 10 > this.pageHeight - 40) {
          pdf.addPage();
          currentY = this.margin;
        }
        
        pdf.setTextColor(100, 100, 100);
        pdf.setFontSize(8);
        let evidenceText = '';
        if (interaction.reportCount) {
          evidenceText += `Based on ${interaction.reportCount} adverse event reports`;
        }
        if (interaction.confidence) {
          evidenceText += evidenceText ? ` • Confidence: ${interaction.confidence}` : `Confidence: ${interaction.confidence}`;
        }
        pdf.text(evidenceText, this.margin + 10, currentY);
        pdf.setTextColor(0, 0, 0);
        currentY += 5;
      }

      currentY += 3;
    });

    // What to do section
    const actionableAdvice = this.getActionableAdvice(overallSeverity);
    
    // Check if "What to do" section fits
    if (currentY + 20 > this.pageHeight - 40) {
      pdf.addPage();
      currentY = this.margin;
    }
    
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('What to do:', this.margin + 5, currentY);
    currentY += 5;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    const wrappedAdvice = pdf.splitTextToSize(actionableAdvice, this.contentWidth - 10);
    pdf.text(wrappedAdvice, this.margin + 10, currentY);
    currentY += wrappedAdvice.length * 4;

    // Source
    pdf.setTextColor(100, 100, 100);
    pdf.setFontSize(8);
    const source = interactionPair.interactions[0]?.source || 'FDA Adverse Events Analysis';
    pdf.text(`Source: ${source}`, this.margin + 5, currentY);
    pdf.setTextColor(0, 0, 0);
    currentY += 8;

    return currentY;
  }

  addSourcesAndMethodology(pdf, currentY) {
    // Always start sources on a new page for better organization
    pdf.addPage();
    currentY = this.margin;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Data Sources & Methodology', this.margin, currentY);
    currentY += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    const sections = [
      {
        title: 'Primary Data Sources:',
        items: [
          'FDA Adverse Event Reporting System (FAERS) via OpenFDA API',
          'RxNorm Database (U.S. National Library of Medicine)',
          'Indian Medicine Database (Curated dataset of Indian pharmaceuticals)'
        ]
      },
      {
        title: 'Analysis Methodology:',
        items: [
          'Adverse event co-occurrence analysis using statistical correlation',
          'Baseline comparison against individual drug adverse event profiles',
          'Severity classification based on reported reaction patterns',
          'Confidence scoring based on report volume and consistency'
        ]
      },
      {
        title: 'Severity Classification:',
        items: [
          'Major: Life-threatening reactions, requires immediate medical attention',
          'Moderate: Significant effects, monitoring required, discuss with provider',
          'Minor: Mild effects, awareness required, inform healthcare provider'
        ]
      }
    ];

    sections.forEach(section => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(section.title, this.margin, currentY);
      currentY += 6;

      pdf.setFont('helvetica', 'normal');
      section.items.forEach(item => {
        const wrappedItem = pdf.splitTextToSize(`• ${item}`, this.contentWidth - 10);
        pdf.text(wrappedItem, this.margin + 5, currentY);
        currentY += wrappedItem.length * 4 + 2;
      });
      currentY += 5;
    });

    currentY += 10;

    // Important notes
    pdf.setFont('helvetica', 'bold');
    pdf.text('Important Notes:', this.margin, currentY);
    currentY += 6;

    pdf.setFont('helvetica', 'normal');
    const notes = [
      'This analysis is based on reported adverse events and statistical patterns.',
      'Individual responses to drug combinations may vary significantly.',
      'This report does not replace professional medical advice.',
      'Always consult your healthcare provider before making medication changes.',
      'Report any adverse effects to your healthcare provider immediately.'
    ];

    notes.forEach(note => {
      const wrappedNote = pdf.splitTextToSize(`• ${note}`, this.contentWidth - 10);
      pdf.text(wrappedNote, this.margin + 5, currentY);
      currentY += wrappedNote.length * 4 + 2;
    });

    return currentY;
  }

  addFooter(pdf) {
    const pageCount = pdf.internal.getNumberOfPages();
    
    // Add footer to all pages
    for (let i = 1; i <= pageCount; i++) {
      pdf.setPage(i);
      
      const footerY = this.pageHeight - 20;
      const digitalSigY = this.pageHeight - 10;
      
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 100, 100);
      
      // Left side - disclaimer
      pdf.text('FOR INFORMATIONAL PURPOSES ONLY - NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE', 
        this.margin, footerY);
      
      // Right side - page number
      const pageText = `Page ${i} of ${pageCount}`;
      const pageTextWidth = pdf.getTextWidth(pageText);
      pdf.text(pageText, this.pageWidth - this.margin - pageTextWidth, footerY);
      
      // Digital signature line
      pdf.setFontSize(7);
      pdf.setTextColor(120, 120, 120);
      const digitalSig = `Generated by MedSure.info • ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`;
      const digitalSigWidth = pdf.getTextWidth(digitalSig);
      pdf.text(digitalSig, (this.pageWidth - digitalSigWidth) / 2, digitalSigY);
      
      pdf.setTextColor(0, 0, 0);
    }
  }

  // Helper methods
  calculateSeverityStats(interactions) {
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
  }

  getOverallSeverity(interactions) {
    const severities = interactions.map(i => i.severity?.toLowerCase() || 'minor');
    
    if (severities.some(s => s.includes('major') || s.includes('severe') || s.includes('high'))) {
      return 'major';
    } else if (severities.some(s => s.includes('moderate') || s.includes('medium'))) {
      return 'moderate';
    }
    return 'minor';
  }

  getSeverityColor(severity) {
    switch (severity) {
      case 'major': return [220, 53, 69]; // Red
      case 'moderate': return [255, 193, 7]; // Yellow
      default: return [23, 162, 184]; // Blue
    }
  }

  formatDescription(description) {
    if (!description) return 'No detailed information available.';
    return description.replace(/^\w+:\s*/, '').replace(/\s+/g, ' ').trim();
  }

  getActionableAdvice(severity) {
    switch (severity) {
      case 'major':
        return 'Contact your healthcare provider immediately. This combination may require medical supervision or alternative medications.';
      case 'moderate':
        return 'Monitor for side effects and discuss with your healthcare provider at your next appointment. They may want to adjust dosages or timing.';
      default:
        return 'Be aware of potential minor interactions. Inform your healthcare provider and monitor for any unusual symptoms.';
    }
  }

  // Public method to export PDF
  async exportToPDF(medications, interactions, patientInfo = {}) {
    try {
      const pdf = await this.generateInteractionReport(medications, interactions, patientInfo);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `Drug-Interaction-Report-${timestamp}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
      return { success: true, filename };
    } catch (error) {
      console.error('PDF export failed:', error);
      return { success: false, error: error.message };
    }
  }
}

export const pdfExportService = new PDFExportService();
