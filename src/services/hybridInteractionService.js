// src/services/hybridInteractionService.js - Comprehensive drug interaction detection
import { knownInteractionsDB } from './knownInteractions.js';
import { openFDAInteractionService } from './openfdaInteractions.js';

class HybridInteractionService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Get cache key for drug pair
  getCacheKey(drug1, drug2) {
    const sorted = [drug1, drug2].sort();
    return `hybrid_${sorted[0]}_${sorted[1]}`;
  }

  // Check if we have cached results
  getCachedResult(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.cacheExpiry) {
      return cached.data;
    }
    return null;
  }

  // Cache results
  setCachedResult(cacheKey, data) {
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
  }

  // Enhanced drug name cleaning for better matching
  cleanDrugName(drugName) {
    if (!drugName) return '';
    
    return drugName.toLowerCase()
      .replace(/\s*\([^)]*\)/g, '') // Remove parentheses content like (20mg)
      .replace(/\s*\d+\s*mg\b/gi, '') // Remove dosage like 20mg
      .replace(/\s*\d+\s*mcg\b/gi, '') // Remove dosage like 100mcg
      .replace(/\s*\d+\s*ml\b/gi, '') // Remove volume like 5ml
      .replace(/\s+tablet(s)?\b/gi, '') // Remove tablet/tablets
      .replace(/\s+capsule(s)?\b/gi, '') // Remove capsule/capsules
      .replace(/\s+injection\b/gi, '') // Remove injection
      .replace(/\s+syrup\b/gi, '') // Remove syrup
      .replace(/\s+cream\b/gi, '') // Remove cream
      .replace(/\s+ointment\b/gi, '') // Remove ointment
      .replace(/\s+oral\b/gi, '') // Remove oral
      .replace(/\s+sodium\b/gi, '') // Remove sodium salt
      .replace(/\s+hydrochloride\b/gi, '') // Remove hydrochloride
      .replace(/\s+hcl\b/gi, '') // Remove HCl
      .replace(/\s+sulphate\b/gi, '') // Remove sulphate
      .replace(/\s+sulfate\b/gi, '') // Remove sulfate
      .replace(/\s+tartrate\b/gi, '') // Remove tartrate
      .replace(/\s+citrate\b/gi, '') // Remove citrate
      .replace(/\s+maleate\b/gi, '') // Remove maleate
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim();
  }

  // Generate alternative drug names for better matching
  generateDrugAlternatives(drugName) {
    const cleaned = this.cleanDrugName(drugName);
    const alternatives = [cleaned, drugName.toLowerCase()];
    
    // Add first word only (most important)
    const firstWord = cleaned.split(' ')[0];
    if (firstWord && firstWord !== cleaned) {
      alternatives.push(firstWord);
    }
    
    // Add variations by removing common terms
    const basicName = drugName.toLowerCase()
      .replace(/\s*\d+.*$/g, '') // Remove everything after first number
      .replace(/\s+(sodium|hydrochloride|hcl|sulphate|sulfate|tartrate|citrate|maleate|oral|tablet|capsule).*$/gi, '')
      .trim();
    
    if (basicName && basicName !== cleaned) {
      alternatives.push(basicName);
    }
    
    return [...new Set(alternatives)]; // Remove duplicates
  }

  // Comprehensive interaction check combining all sources
  async checkDrugInteraction(drug1Name, drug2Name) {
    const cacheKey = this.getCacheKey(drug1Name, drug2Name);
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    try {
      const results = {
        success: true,
        drug1: drug1Name,
        drug2: drug2Name,
        hasInteraction: false,
        interactions: [],
        sources: [],
        highestSeverity: 'none',
        confidence: 'low'
      };

      // 1. PRIORITY: Check critical known interactions first
      // Generate clean alternatives for better matching
      const drug1Alternatives = this.generateDrugAlternatives(drug1Name);
      const drug2Alternatives = this.generateDrugAlternatives(drug2Name);
      
      let knownInteraction = { found: false };
      let safeCombination = { found: false };
      
      // Try all combinations of cleaned names
      for (const alt1 of drug1Alternatives) {
        for (const alt2 of drug2Alternatives) {
          // Check for critical interactions first
          knownInteraction = knownInteractionsDB.checkKnownInteraction(alt1, alt2);
          if (knownInteraction.found) {
            break;
          }
          
          // Check for known safe combinations
          safeCombination = knownInteractionsDB.checkSafeCombination(alt1, alt2);
          if (safeCombination.found) {
            break;
          }
        }
        if (knownInteraction.found || safeCombination.found) break;
      }
      
      if (knownInteraction.found) {
        results.hasInteraction = true;
        results.highestSeverity = knownInteraction.severity;
        results.confidence = 'high'; // Known interactions are high confidence
        
        results.interactions.push({
          severity: knownInteraction.severity,
          description: knownInteraction.description,
          mechanism: knownInteraction.mechanism,
          clinicalEffects: knownInteraction.clinicalEffects,
          monitoring: knownInteraction.monitoring,
          recommendation: knownInteraction.recommendation,
          source: knownInteraction.source,
          methodology: knownInteraction.methodology,
          reactionName: `${knownInteraction.mechanism} - Critical Interaction`,
          confidence: 'high',
          evidenceLevel: 'clinical_literature'
        });
        
        results.sources.push('Clinical Knowledge Base');
      }

      // 2. Check if this is a known safe combination (overrides OpenFDA false positives)
      if (safeCombination.found) {
        // This is a known safe combination - don't run OpenFDA analysis
        // as it often produces false positives for common OTC combinations
        results.hasInteraction = false;
        results.confidence = 'high';
        results.safeCombination = {
          note: safeCombination.note,
          safety: safeCombination.safety,
          examples: safeCombination.examples,
          sources: safeCombination.sources,
          source: safeCombination.source
        };
        results.sources.push('Clinical Safety Database');
      } else {
        // 3. SECONDARY: Enhanced OpenFDA analysis with multiple name variants (only if not a known safe combination)
        await this.addOpenFDAResults(results, drug1Name, drug2Name, drug1Alternatives, drug2Alternatives);
      }

      // 4. Determine overall confidence and severity
      this.finalizeResults(results);

      // Cache the result
      this.setCachedResult(cacheKey, results);

      return results;

    } catch (error) {
      console.error('Hybrid interaction analysis failed:', error);
      return {
        success: false,
        error: error.message,
        drug1: drug1Name,
        drug2: drug2Name
      };
    }
  }

  // Enhanced OpenFDA analysis with better name matching
  async addOpenFDAResults(results, drug1Name, drug2Name, drug1Alternatives, drug2Alternatives) {
    try {
      // Use pre-computed alternatives or generate them if not provided
      const alt1 = drug1Alternatives || this.generateDrugAlternatives(drug1Name);
      const alt2 = drug2Alternatives || this.generateDrugAlternatives(drug2Name);

      let bestOpenFDAResult = null;
      let maxReports = 0;

      // Try different name combinations
      for (const alt1Name of alt1) {
        for (const alt2Name of alt2) {
          try {
            const openFDAResult = await openFDAInteractionService.checkDrugInteraction(alt1Name, alt2Name);
            
            if (openFDAResult.success && openFDAResult.hasInteraction && 
                openFDAResult.reportCount > maxReports) {
              bestOpenFDAResult = openFDAResult;
              maxReports = openFDAResult.reportCount;
            }
          } catch (error) {
            // Continue with other combinations
            console.debug(`OpenFDA query failed for ${alt1Name} + ${alt2Name}:`, error.message);
          }
        }
      }

      // Add OpenFDA results if found
      if (bestOpenFDAResult && bestOpenFDAResult.hasInteraction) {
        results.hasInteraction = true;
        results.sources.push('OpenFDA Adverse Events');
        
        bestOpenFDAResult.interactions.forEach(reaction => {
          results.interactions.push({
            severity: reaction.severity,
            description: reaction.description,
            source: 'OpenFDA Adverse Events Analysis',
            methodology: 'Adverse event co-occurrence analysis',
            reactionName: reaction.reaction,
            reportCount: bestOpenFDAResult.reportCount,
            confidence: bestOpenFDAResult.confidence,
            elevationFactor: reaction.elevationFactor,
            evidenceLevel: 'adverse_event_reports'
          });
        });

        // Update highest severity if OpenFDA found something more severe
        const openFDASeverity = this.normalizeSeverity(bestOpenFDAResult.severity);
        if (this.compareSeverity(openFDASeverity, results.highestSeverity) > 0) {
          results.highestSeverity = openFDASeverity;
        }
      }

    } catch (error) {
      console.warn('OpenFDA analysis failed in hybrid service:', error);
      // Don't fail the entire check if OpenFDA fails
    }
  }

  // Finalize results with confidence scoring
  finalizeResults(results) {
    if (!results.hasInteraction) {
      return;
    }

    // Calculate overall confidence based on sources and evidence
    const hasKnownInteraction = results.sources.includes('Clinical Knowledge Base');
    const hasOpenFDAData = results.sources.includes('OpenFDA Adverse Events');
    
    if (hasKnownInteraction) {
      results.confidence = 'high'; // Known interactions are always high confidence
    } else if (hasOpenFDAData) {
      const totalReports = results.interactions.reduce((sum, int) => 
        sum + (int.reportCount || 0), 0);
      
      if (totalReports >= 50) {
        results.confidence = 'medium';
      } else if (totalReports >= 10) {
        results.confidence = 'low';
      } else {
        results.confidence = 'very_low';
      }
    }

    // Ensure we have a severity
    if (results.highestSeverity === 'none' && results.interactions.length > 0) {
      results.highestSeverity = 'minor';
    }
  }

  // Normalize severity levels
  normalizeSeverity(severity) {
    if (!severity) return 'minor';
    const s = severity.toLowerCase();
    
    if (s.includes('major') || s.includes('severe') || s.includes('high')) {
      return 'major';
    } else if (s.includes('moderate') || s.includes('medium')) {
      return 'moderate';
    }
    return 'minor';
  }

  // Compare severity levels (returns > 0 if sev1 > sev2)
  compareSeverity(sev1, sev2) {
    const levels = { 'major': 3, 'moderate': 2, 'minor': 1, 'none': 0 };
    return (levels[sev1] || 0) - (levels[sev2] || 0);
  }

  // Check interactions for multiple drug pairs
  async checkMultipleDrugInteractions(medications) {
    if (medications.length < 2) {
      return { interactions: [], summary: { total: 0, major: 0, moderate: 0, minor: 0 } };
    }

    const results = [];
    const summary = { total: 0, major: 0, moderate: 0, minor: 0 };

    // Check all pairs
    for (let i = 0; i < medications.length; i++) {
      for (let j = i + 1; j < medications.length; j++) {
        const med1 = medications[i];
        const med2 = medications[j];
        
        // Use the best available name for interaction checking
        const drug1Name = this.getBestDrugName(med1);
        const drug2Name = this.getBestDrugName(med2);
        

        if (drug1Name && drug2Name) {
          try {
            const interaction = await this.checkDrugInteraction(drug1Name, drug2Name);
            
            if (interaction.success && interaction.hasInteraction) {
              results.push({
                medication1: med1,
                medication2: med2,
                interactions: interaction.interactions,
                severity: interaction.highestSeverity,
                confidence: interaction.confidence,
                sources: interaction.sources,
                pairId: `${med1.id || med1.rxcui}_${med2.id || med2.rxcui}`
              });

              summary.total++;
              summary[interaction.highestSeverity]++;
            }
          } catch (error) {
            console.warn(`Failed to check interaction between ${drug1Name} and ${drug2Name}:`, error);
          }
        }
      }
    }

    return { interactions: results, summary };
  }

  // Get the best drug name for interaction checking
  getBestDrugName(medication) {
    // Priority: genericName > name > synonym
    return medication.genericName || 
           medication.name || 
           medication.synonym || 
           medication.interactionName;
  }

  // Get statistics about the hybrid service
  getServiceStats() {
    const knownStats = knownInteractionsDB.getStats();
    return {
      knownInteractions: knownStats,
      cacheSize: this.cache.size,
      sources: ['Clinical Knowledge Base', 'OpenFDA Adverse Events']
    };
  }
}

export const hybridInteractionService = new HybridInteractionService();
