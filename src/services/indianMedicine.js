// src/services/indianMedicine.js
class IndianMedicineAPI {
    constructor() {
      this.medicineData = [];
      this.loaded = false;
      this.loadDataset();
    }
  
    async loadDataset() {
      try {
        // Load the Indian medicine dataset
        const response = await fetch('/indian_medicine_data.json');
        const data = await response.json();
        this.medicineData = data;
        this.loaded = true;
        console.log(`Loaded ${data.length} Indian medications`);
      } catch (error) {
        console.warn('Could not load Indian medicine dataset:', error);
        this.loaded = false;
      }
    }
  
    // Extract generic name from composition
    extractGenericName(composition1, composition2, medicineName) {
      if (!composition1 && !composition2) return null;
  
      // Common patterns to extract generic names
      const patterns = [
        // "Fluoxetine (20mg)" -> "Fluoxetine"
        /^([A-Za-z\s]+)\s*\(/,
        // "Amoxycillin 500mg" -> "Amoxycillin"
        /^([A-Za-z\s]+)\s+\d+/,
        // Just the composition if it's clean
        /^([A-Za-z\s]+)$/
      ];
  
      const compositions = [composition1, composition2].filter(Boolean);
      
      for (const composition of compositions) {
        if (!composition) continue;
        
        for (const pattern of patterns) {
          const match = composition.match(pattern);
          if (match) {
            let genericName = match[1].trim();
            
            // Clean up common suffixes/prefixes
            genericName = genericName
              .replace(/\b(Sodium|Hydrochloride|HCl|Sulphate|Sulfate|Tartrate|Citrate|Maleate)\b/gi, '')
              .replace(/\s+/g, ' ')
              .trim();
              
            if (genericName.length >= 3) {
              return genericName;
            }
          }
        }
      }
  
      // Fallback: try to extract from medicine name
      const namePatterns = [
        // "Fludac 20mg" -> "Fludac" (brand), but we need generic
        // This is less reliable, mainly for fallback
        /^([A-Za-z]+)/
      ];
  
      for (const pattern of namePatterns) {
        const match = medicineName.match(pattern);
        if (match && match[1].length >= 4) {
          return match[1];
        }
      }
  
      return null;
    }
  
    // Search Indian medicines
    searchMedicines(searchTerm, limit = 10) {
      if (!this.loaded || !searchTerm || searchTerm.length < 2) {
        return [];
      }
  
      const term = searchTerm.toLowerCase().trim();
      const results = [];
  
      for (const medicine of this.medicineData) {
        if (results.length >= limit) break;
  
        const name = medicine.name?.toLowerCase() || '';
        const composition1 = medicine.short_composition1?.toLowerCase() || '';
        const composition2 = medicine.short_composition2?.toLowerCase() || '';
        
        // Search in name and composition
        if (name.includes(term) || 
            composition1.includes(term) || 
            composition2.includes(term)) {
          
          // Extract generic name for interaction checking
          const genericName = this.extractGenericName(
            medicine.short_composition1,
            medicine.short_composition2,
            medicine.name
          );
  
          results.push({
            // Keep original Indian data
            ...medicine,
            // Add fields for compatibility with existing code
            rxcui: `indian_${medicine.id}`, // Fake RxCUI for Indian meds
            synonym: medicine.name,
            tty: 'INDIAN_BRAND',
            language: 'ENG',
            suppress: 'N',
            // Add extracted generic for interaction checking
            genericName: genericName,
            isIndianMedicine: true,
            // Formatted price
            formattedPrice: medicine['price(₹)'] ? `₹${medicine['price(₹)']}` : null
          });
        }
      }
  
      // Sort by relevance (exact matches first)
      return results.sort((a, b) => {
        const aName = a.name?.toLowerCase() || '';
        const bName = b.name?.toLowerCase() || '';
        
        if (aName.startsWith(term) && !bName.startsWith(term)) return -1;
        if (!aName.startsWith(term) && bName.startsWith(term)) return 1;
        
        return 0;
      });
    }
  
    // Get medicine by ID
    getMedicineById(id) {
      if (!this.loaded) return null;
      return this.medicineData.find(med => med.id === id);
    }
  
    // Check if dataset is loaded
    isLoaded() {
      return this.loaded;
    }
  
    // Get dataset statistics
    getStats() {
      if (!this.loaded) return null;
      
      const stats = {
        total: this.medicineData.length,
        byType: {},
        byManufacturer: {}
      };
  
      this.medicineData.forEach(med => {
        // Count by type
        const type = med.type || 'unknown';
        stats.byType[type] = (stats.byType[type] || 0) + 1;
        
        // Count by manufacturer (top 10)
        const manufacturer = med.manufacturer_name || 'unknown';
        stats.byManufacturer[manufacturer] = (stats.byManufacturer[manufacturer] || 0) + 1;
      });
  
      return stats;
    }
  }
  
  export const indianMedicineAPI = new IndianMedicineAPI();