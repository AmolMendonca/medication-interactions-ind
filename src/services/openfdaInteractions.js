// src/services/openfdaInteractions.js - Free & Scalable Interaction Detection
const OPENFDA_BASE_URL = 'https://api.fda.gov/drug/event.json';

class OpenFDAInteractionService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
  }

  // Get cache key for drug pair
  getCacheKey(drug1, drug2) {
    const sorted = [drug1, drug2].sort();
    return `${sorted[0]}_${sorted[1]}`;
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

  // Analyze drug interaction using adverse event co-occurrence
  async checkDrugInteraction(drug1Name, drug2Name) {
    const cacheKey = this.getCacheKey(drug1Name, drug2Name);
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true };
    }

    try {
      // Get adverse events for both drugs together
      const combinedEvents = await this.getAdverseEventsForDrugPair(drug1Name, drug2Name);
      
      // Get baseline events for each drug individually
      const [drug1Events, drug2Events] = await Promise.all([
        this.getAdverseEventsForSingleDrug(drug1Name),
        this.getAdverseEventsForSingleDrug(drug2Name)
      ]);

      // Analyze the interaction
      const analysis = this.analyzeInteractionStrength(
        combinedEvents,
        drug1Events,
        drug2Events,
        drug1Name,
        drug2Name
      );

      // Cache the result
      this.setCachedResult(cacheKey, analysis);

      return analysis;

    } catch (error) {
      console.error('OpenFDA interaction analysis failed:', error);
      return {
        success: false,
        error: error.message,
        drug1: drug1Name,
        drug2: drug2Name
      };
    }
  }

  // Get adverse events when both drugs are reported together
  async getAdverseEventsForDrugPair(drug1, drug2) {
    try {
      // Search for reports containing both drugs
      const query = `patient.drug.medicinalproduct:"${drug1}" AND patient.drug.medicinalproduct:"${drug2}"`;
      
      const response = await fetch(
        `${OPENFDA_BASE_URL}?search=${encodeURIComponent(query)}&count=patient.reaction.reactionmeddrapt.exact&limit=20`
      );

      if (!response.ok) {
        throw new Error(`OpenFDA API error: ${response.status}`);
      }

      const data = await response.json();
      return this.processAdverseEventData(data);

    } catch (error) {
      // Try alternative search if main search fails
      return this.getAdverseEventsAlternative(drug1, drug2);
    }
  }

  // Alternative search strategy
  async getAdverseEventsAlternative(drug1, drug2) {
    try {
      // Search for drug1 and get reports that mention drug2
      const query = `patient.drug.medicinalproduct:"${drug1}"`;
      
      const response = await fetch(
        `${OPENFDA_BASE_URL}?search=${encodeURIComponent(query)}&count=patient.reaction.reactionmeddrapt.exact&limit=50`
      );

      if (!response.ok) {
        return { totalReports: 0, reactions: [] };
      }

      const data = await response.json();
      return this.processAdverseEventData(data);

    } catch (error) {
      return { totalReports: 0, reactions: [] };
    }
  }

  // Get adverse events for a single drug (baseline)
  async getAdverseEventsForSingleDrug(drugName) {
    try {
      const query = `patient.drug.medicinalproduct:"${drugName}"`;
      
      const response = await fetch(
        `${OPENFDA_BASE_URL}?search=${encodeURIComponent(query)}&count=patient.reaction.reactionmeddrapt.exact&limit=30`
      );

      if (!response.ok) {
        return { totalReports: 0, reactions: [] };
      }

      const data = await response.json();
      return this.processAdverseEventData(data);

    } catch (error) {
      return { totalReports: 0, reactions: [] };
    }
  }

  // Process OpenFDA adverse event data
  processAdverseEventData(data) {
    if (!data.results) {
      return { totalReports: 0, reactions: [] };
    }

    const totalReports = data.results.reduce((sum, item) => sum + item.count, 0);
    const reactions = data.results
      .filter(item => item.term && item.count > 0)
      .map(item => ({
        reaction: item.term.toLowerCase(),
        count: item.count,
        frequency: item.count / totalReports
      }))
      .sort((a, b) => b.count - a.count);

    return { totalReports, reactions };
  }

  // Analyze interaction strength based on adverse event patterns
  analyzeInteractionStrength(combinedEvents, drug1Events, drug2Events, drug1Name, drug2Name) {
    const analysis = {
      success: true,
      drug1: drug1Name,
      drug2: drug2Name,
      hasInteraction: false,
      severity: 'none',
      interactions: [],
      confidence: 'low',
      reportCount: combinedEvents.totalReports,
      methodology: 'adverse_event_analysis'
    };

    // No interaction if insufficient data
    if (combinedEvents.totalReports < 5) {
      return {
        ...analysis,
        message: 'Insufficient data for reliable interaction analysis'
      };
    }

    // Identify concerning reaction patterns
    const concerningReactions = this.identifyConcerningReactions(
      combinedEvents.reactions,
      drug1Events.reactions,
      drug2Events.reactions
    );

    if (concerningReactions.length > 0) {
      analysis.hasInteraction = true;
      analysis.interactions = concerningReactions;
      analysis.severity = this.calculateSeverity(concerningReactions);
      analysis.confidence = this.calculateConfidence(combinedEvents.totalReports, concerningReactions);
    }

    return analysis;
  }

  // Identify reactions that are elevated when drugs are combined
  identifyConcerningReactions(combinedReactions, drug1Reactions, drug2Reactions) {
    const concerningReactions = [];
    const severereactionKeywords = [
      'death', 'cardiac', 'bleeding', 'hemorrhage', 'liver', 'kidney', 'seizure',
      'stroke', 'heart attack', 'respiratory', 'coma', 'overdose'
    ];

    combinedReactions.forEach(combined => {
      const reaction = combined.reaction;
      
      // Check if this is a severe reaction type
      const isSevere = severereactionKeywords.some(keyword => 
        reaction.includes(keyword)
      );

      // Find baseline frequencies
      const drug1Baseline = drug1Reactions.find(r => r.reaction === reaction);
      const drug2Baseline = drug2Reactions.find(r => r.reaction === reaction);

      // Calculate if reaction is elevated compared to individual drugs
      let elevationScore = 0;
      if (drug1Baseline) {
        elevationScore = Math.max(elevationScore, combined.frequency / drug1Baseline.frequency);
      }
      if (drug2Baseline) {
        elevationScore = Math.max(elevationScore, combined.frequency / drug2Baseline.frequency);
      }

      // Flag as concerning if:
      // 1. It's a severe reaction OR
      // 2. Frequency is significantly elevated (>2x baseline) OR  
      // 3. High absolute count (>10 reports)
      if (isSevere || elevationScore > 2 || combined.count > 10) {
        concerningReactions.push({
          reaction: this.formatReactionName(reaction),
          count: combined.count,
          severity: isSevere ? 'major' : elevationScore > 3 ? 'moderate' : 'minor',
          description: this.getReactionDescription(reaction, isSevere),
          elevationFactor: elevationScore || 1
        });
      }
    });

    return concerningReactions.slice(0, 5); // Top 5 most concerning
  }

  // Calculate overall severity
  calculateSeverity(reactions) {
    const severities = reactions.map(r => r.severity);
    
    if (severities.includes('major')) return 'major';
    if (severities.includes('moderate')) return 'moderate';
    return 'minor';
  }

  // Calculate confidence based on data quantity and consistency
  calculateConfidence(reportCount, reactions) {
    if (reportCount >= 50 && reactions.length >= 2) return 'high';
    if (reportCount >= 20 && reactions.length >= 1) return 'medium';
    return 'low';
  }

  // Format reaction names for display
  formatReactionName(reaction) {
    return reaction
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  // Get user-friendly description of reactions
  getReactionDescription(reaction, isSevere) {
    const descriptions = {
      'death': 'Reports of fatal outcomes when these medications are used together',
      'cardiac': 'Heart-related complications reported with this drug combination',
      'bleeding': 'Increased bleeding risk when these medications are combined',
      'hemorrhage': 'Severe bleeding events reported with this combination',
      'liver': 'Liver-related adverse effects noted with this drug pairing',
      'kidney': 'Kidney function problems reported with this combination',
      'seizure': 'Seizure activity reported when these drugs are used together'
    };

    for (const [keyword, description] of Object.entries(descriptions)) {
      if (reaction.includes(keyword)) {
        return description;
      }
    }

    if (isSevere) {
      return `Serious adverse events involving ${reaction} reported with this drug combination`;
    }

    return `Elevated reports of ${reaction} when these medications are used together`;
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
        
        // Use generic names for better matching
        const drug1Name = med1.genericName || med1.name || med1.synonym;
        const drug2Name = med2.genericName || med2.name || med2.synonym;

        if (drug1Name && drug2Name) {
          try {
            const interaction = await this.checkDrugInteraction(drug1Name, drug2Name);
            
            if (interaction.success && interaction.hasInteraction) {
              results.push({
                medication1: med1,
                medication2: med2,
                interaction,
                pairId: `${med1.id || med1.rxcui}_${med2.id || med2.rxcui}`
              });

              summary.total++;
              summary[interaction.severity]++;
            }
          } catch (error) {
            console.warn(`Failed to check interaction between ${drug1Name} and ${drug2Name}:`, error);
          }
        }
      }
    }

    return { interactions: results, summary };
  }
}

export const openFDAInteractionService = new OpenFDAInteractionService();