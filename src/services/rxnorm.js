// src/services/rxnorm.js - Enhanced version
const RXNORM_BASE_URL = 'https://rxnav.nlm.nih.gov/REST';

class RxNormAPI {
  async searchDrugs(searchTerm) {
    try {
      const response = await fetch(
        `${RXNORM_BASE_URL}/drugs.json?name=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatSearchResults(data);
    } catch (error) {
      console.error('RxNorm search error:', error);
      throw error;
    }
  }

  // New method: Search by generic name and get RxCUI for interactions
  async findGenericRxCUI(genericName) {
    try {
      // First try approximate match for better results
      const response = await fetch(
        `${RXNORM_BASE_URL}/approximateTerm.json?term=${encodeURIComponent(genericName)}&maxEntries=5`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.approximateGroup?.candidate && data.approximateGroup.candidate.length > 0) {
        // Return the first good match
        const candidate = data.approximateGroup.candidate[0];
        return {
          rxcui: candidate.rxcui,
          name: candidate.name,
          score: candidate.score,
          found: true
        };
      }
      
      return { found: false, genericName };
    } catch (error) {
      console.error('Generic RxCUI lookup error:', error);
      return { found: false, genericName, error: error.message };
    }
  }

  // Get drug interactions by RxCUI
  async getInteractions(rxcui) {
    try {
      // Use the correct RxNorm interaction endpoint without DrugBank source
      const response = await fetch(
        `${RXNORM_BASE_URL}/interaction/interaction.json?rxcui=${rxcui}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return this.formatInteractionResults(data);
    } catch (error) {
      console.error('Interaction lookup error:', error);
      throw error;
    }
  }

  formatSearchResults(data) {
    const drugGroup = data.drugGroup;
    if (!drugGroup?.conceptGroup) return [];

    const results = [];
    
    drugGroup.conceptGroup.forEach(group => {
      if (group.conceptProperties) {
        group.conceptProperties.forEach(concept => {
          results.push({
            rxcui: concept.rxcui,
            name: concept.name,
            synonym: concept.synonym,
            tty: concept.tty,
            language: concept.language,
            suppress: concept.suppress,
            umlscui: concept.umlscui,
            isIndianMedicine: false
          });
        });
      }
    });

    return results
      .filter(drug => drug.suppress !== 'Y' && drug.language === 'ENG')
      .sort((a, b) => {
        const priority = { 'SCD': 1, 'SBD': 2, 'GPCK': 3, 'BPCK': 4 };
        return (priority[a.tty] || 99) - (priority[b.tty] || 99);
      })
      .slice(0, 10);
  }

  formatInteractionResults(data) {
    if (!data.interactionTypeGroup) return [];

    const interactions = [];
    
    data.interactionTypeGroup.forEach(group => {
      if (group.interactionType) {
        group.interactionType.forEach(interaction => {
          if (interaction.interactionPair) {
            interaction.interactionPair.forEach(pair => {
              interactions.push({
                severity: pair.severity || 'Unknown',
                description: pair.description || 'No description available',
                interactionConcept: pair.interactionConcept || [],
                source: interaction.minConceptItem?.name || 'Unknown'
              });
            });
          }
        });
      }
    });

    return interactions;
  }

  // New method: Check interactions between two medications by generic names
  async checkGenericInteractions(genericName1, genericName2) {
    try {
      // Get RxCUIs for both generics
      const [rxcui1, rxcui2] = await Promise.all([
        this.findGenericRxCUI(genericName1),
        this.findGenericRxCUI(genericName2)
      ]);

      if (!rxcui1.found || !rxcui2.found) {
        return {
          success: false,
          message: `Could not find RxCUI for: ${!rxcui1.found ? genericName1 : ''} ${!rxcui2.found ? genericName2 : ''}`.trim(),
          details: { rxcui1, rxcui2 }
        };
      }

      // Check for interactions for the first drug
      const response = await fetch(
        `${RXNORM_BASE_URL}/interaction/interaction.json?rxcui=${rxcui1.rxcui}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const allInteractions = this.formatInteractionResults(data);

      // Filter interactions that involve the second drug
      const relevantInteractions = allInteractions.filter(interaction => {
        if (!interaction.interactionConcept) return false;
        
        return interaction.interactionConcept.some(concept => {
          const conceptName = concept.minConceptItem?.name?.toLowerCase() || '';
          const conceptRxcui = concept.minConceptItem?.rxcui || '';
          
          return conceptRxcui === rxcui2.rxcui || 
                 conceptName.includes(genericName2.toLowerCase()) ||
                 genericName2.toLowerCase().includes(conceptName);
        });
      });

      return {
        success: true,
        interactions: relevantInteractions,
        drug1: { name: genericName1, ...rxcui1 },
        drug2: { name: genericName2, ...rxcui2 },
        allInteractionsCount: allInteractions.length
      };

    } catch (error) {
      return {
        success: false,
        message: 'Error checking drug interactions',
        error: error.message
      };
    }
  }
}

export const rxnormAPI = new RxNormAPI();