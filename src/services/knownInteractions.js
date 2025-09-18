// src/services/knownInteractions.js - Curated critical drug interactions database
// Based on FDA, clinical literature, and drug interaction databases

class KnownInteractionsDB {
  constructor() {
    // Critical interactions that must never be missed
    this.criticalInteractions = this.buildCriticalInteractionsDB();
    
    // Known safe combinations (to override false OpenFDA positives)
    this.safeCombinations = this.buildSafeCombinationsDB();
    
    // Drug name mappings for better matching
    this.drugNameMappings = this.buildDrugNameMappings();
  }

  buildCriticalInteractionsDB() {
    return {
      // Cardiovascular interactions
      'diltiazem-carvedilol': {
        severity: 'major',
        mechanism: 'Additive cardiovascular effects',
        description: 'Both diltiazem and carvedilol can lower heart rate and blood pressure. Concurrent use may lead to severe bradycardia, hypotension, and cardiac conduction abnormalities.',
        clinicalEffects: [
          'Severe bradycardia (slow heart rate)',
          'Hypotension (low blood pressure)', 
          'AV block (heart conduction problems)',
          'Cardiac arrest in severe cases'
        ],
        monitoring: 'Close cardiac monitoring required. Monitor heart rate, blood pressure, and ECG.',
        recommendation: 'Use with extreme caution. Consider alternative medications. If used together, start with lowest doses and monitor closely.',
        sources: ['FDA', 'Clinical literature', 'Drugs.com']
      },

      'diltiazem-metoprolol': {
        severity: 'major',
        mechanism: 'Additive negative chronotropic and inotropic effects',
        description: 'Combination of calcium channel blocker with beta-blocker can cause severe cardiovascular depression.',
        clinicalEffects: [
          'Severe bradycardia',
          'Heart failure exacerbation',
          'Hypotension',
          'AV block'
        ],
        monitoring: 'Cardiac monitoring essential',
        recommendation: 'Use together only under specialist supervision',
        sources: ['FDA', 'Clinical guidelines']
      },

      'diltiazem-propranolol': {
        severity: 'major',
        mechanism: 'Additive cardiovascular effects',
        description: 'Combined negative chronotropic and inotropic effects can lead to severe cardiac depression.',
        clinicalEffects: ['Severe bradycardia', 'Hypotension', 'Cardiac conduction abnormalities'],
        monitoring: 'Continuous cardiac monitoring',
        recommendation: 'Avoid combination if possible',
        sources: ['FDA', 'Clinical literature']
      },

      'verapamil-carvedilol': {
        severity: 'major',
        mechanism: 'Additive cardiovascular depression',
        description: 'Both drugs significantly depress cardiac function when used together.',
        clinicalEffects: ['Severe bradycardia', 'Hypotension', 'Heart failure'],
        monitoring: 'Close cardiac monitoring required',
        recommendation: 'Use with extreme caution',
        sources: ['FDA', 'Clinical guidelines']
      },

      // Anticoagulant interactions
      'aspirin-warfarin': {
        severity: 'major',
        mechanism: 'Increased bleeding risk',
        description: 'Warfarin and aspirin both affect blood clotting through different mechanisms, significantly increasing bleeding risk.',
        clinicalEffects: [
          'Major bleeding',
          'Gastrointestinal bleeding',
          'Intracranial hemorrhage',
          'Excessive anticoagulation'
        ],
        monitoring: 'Frequent INR monitoring, watch for bleeding signs',
        recommendation: 'Use together only when benefits clearly outweigh risks. Consider PPI for GI protection.',
        sources: ['FDA', 'Clinical guidelines', 'Hematology literature']
      },

      'ibuprofen-warfarin': {
        severity: 'major',
        mechanism: 'Increased bleeding risk and INR elevation',
        description: 'NSAIDs can increase warfarin effect and independently increase bleeding risk.',
        clinicalEffects: ['Major bleeding', 'Elevated INR', 'GI bleeding'],
        monitoring: 'Frequent INR checks, bleeding assessment',
        recommendation: 'Avoid if possible. Use acetaminophen as alternative.',
        sources: ['FDA', 'Clinical literature']
      },

      // CNS interactions
      'fluoxetine-tramadol': {
        severity: 'major',
        mechanism: 'Serotonin syndrome risk',
        description: 'Both drugs increase serotonin activity, potentially causing life-threatening serotonin syndrome.',
        clinicalEffects: [
          'Serotonin syndrome',
          'Hyperthermia',
          'Altered mental status',
          'Neuromuscular abnormalities',
          'Seizures'
        ],
        monitoring: 'Monitor for serotonin syndrome symptoms',
        recommendation: 'Avoid combination. Consider alternative pain management.',
        sources: ['FDA', 'Psychiatry literature']
      },

      'sertraline-tramadol': {
        severity: 'major',
        mechanism: 'Serotonin syndrome risk',
        description: 'Increased risk of serotonin syndrome and seizures.',
        clinicalEffects: ['Serotonin syndrome', 'Seizures', 'CNS toxicity'],
        monitoring: 'Close neurological monitoring',
        recommendation: 'Use with extreme caution',
        sources: ['FDA', 'Clinical literature']
      },

      // Metabolic interactions
      'clarithromycin-simvastatin': {
        severity: 'major',
        mechanism: 'CYP3A4 inhibition increases statin levels',
        description: 'Clarithromycin significantly increases simvastatin levels, leading to rhabdomyolysis risk.',
        clinicalEffects: [
          'Rhabdomyolysis',
          'Muscle damage',
          'Kidney failure',
          'Elevated CK levels'
        ],
        monitoring: 'Monitor for muscle symptoms, CK levels',
        recommendation: 'Avoid combination. Suspend statin during clarithromycin course.',
        sources: ['FDA', 'Clinical literature']
      },

      // Respiratory interactions
      'midazolam-morphine': {
        severity: 'major',
        mechanism: 'Additive respiratory depression',
        description: 'Combined use significantly increases risk of severe respiratory depression.',
        clinicalEffects: [
          'Severe respiratory depression',
          'Coma',
          'Death',
          'Hypoxia'
        ],
        monitoring: 'Continuous respiratory monitoring',
        recommendation: 'Avoid combination unless in monitored setting',
        sources: ['FDA', 'Anesthesiology literature']
      }
    };
  }

  buildSafeCombinationsDB() {
    return {
      // Common OTC combinations that are well-established as safe
      'chlorpheniramine-paracetamol': {
        note: 'Extremely common combination in OTC cold medications worldwide',
        safety: 'Well-established safety profile',
        examples: ['Sinarest', 'D-Cold', 'Crocin Cold & Flu', 'Tylenol Cold'],
        sources: ['WHO Essential Medicines', 'FDA OTC monographs', 'Clinical literature']
      },
      
      'acetaminophen-chlorpheniramine': {
        note: 'Same as paracetamol-chlorpheniramine (different naming)',
        safety: 'Well-established safety profile',
        examples: ['Tylenol Cold', 'Sudafed PE', 'Robitussin Cold'],
        sources: ['WHO Essential Medicines', 'FDA OTC monographs']
      },
      
      'acetaminophen-ibuprofen': {
        note: 'Commonly used together for pain/fever management',
        safety: 'Safe when used at recommended doses',
        examples: ['Often prescribed together by doctors'],
        sources: ['Pediatric guidelines', 'Clinical literature']
      },
      
      'paracetamol-ibuprofen': {
        note: 'Same as acetaminophen-ibuprofen (different naming)',
        safety: 'Safe when used at recommended doses',
        examples: ['WHO pain management guidelines'],
        sources: ['WHO guidelines', 'Pediatric literature']
      }
    };
  }

  buildDrugNameMappings() {
    // Maps various drug names to standard forms for better matching
    return {
      // Cardiovascular drugs
      'diltiazem': ['diltiazem', 'cardizem', 'tiazac', 'cartia'],
      'carvedilol': ['carvedilol', 'coreg', 'kredex'],
      'metoprolol': ['metoprolol', 'lopressor', 'toprol'],
      'propranolol': ['propranolol', 'inderal', 'hemangeol'],
      'verapamil': ['verapamil', 'calan', 'isoptin', 'verelan'],
      
      // Anticoagulants
      'warfarin': ['warfarin', 'coumadin', 'jantoven'],
      'aspirin': ['aspirin', 'acetylsalicylic acid', 'asa', 'ecosprin', 'disprin'],
      'ibuprofen': ['ibuprofen', 'advil', 'motrin', 'brufen'],
      
      // CNS drugs
      'tramadol': ['tramadol', 'ultram', 'conzip'],
      'fluoxetine': ['fluoxetine', 'prozac', 'sarafem', 'fludac'],
      'sertraline': ['sertraline', 'zoloft', 'lustral'],
      
      // Statins
      'simvastatin': ['simvastatin', 'zocor'],
      'clarithromycin': ['clarithromycin', 'biaxin', 'klacid'],
      
      // Opioids/Benzos
      'morphine': ['morphine', 'ms contin', 'kadian'],
      'midazolam': ['midazolam', 'versed', 'dormicum'],
      
      // OTC medications
      'paracetamol': ['paracetamol', 'acetaminophen', 'tylenol', 'crocin', 'dolo'],
      'acetaminophen': ['acetaminophen', 'paracetamol', 'tylenol'],
      'chlorpheniramine': ['chlorpheniramine', 'chlorphenamine', 'clp'],
      'ibuprofen': ['ibuprofen', 'advil', 'motrin', 'brufen']
    };
  }

  // Normalize drug name for matching
  normalizeDrugName(drugName) {
    if (!drugName) return '';
    
    const normalized = drugName.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special characters
      .replace(/\s+/g, ' ')        // Normalize spaces
      .trim();
    
    // Check if this matches any of our mapped names
    for (const [standard, variants] of Object.entries(this.drugNameMappings)) {
      if (variants.some(variant => 
        normalized.includes(variant) || variant.includes(normalized)
      )) {
        return standard;
      }
    }
    
    return normalized;
  }

  // Generate interaction key for two drugs
  getInteractionKey(drug1, drug2) {
    const norm1 = this.normalizeDrugName(drug1);
    const norm2 = this.normalizeDrugName(drug2);
    
    // Always order alphabetically for consistent keys
    const sorted = [norm1, norm2].sort();
    return `${sorted[0]}-${sorted[1]}`;
  }

  // Check for known critical interactions
  checkKnownInteraction(drug1Name, drug2Name) {
    const interactionKey = this.getInteractionKey(drug1Name, drug2Name);
    const interaction = this.criticalInteractions[interactionKey];
    
    if (interaction) {
      return {
        found: true,
        severity: interaction.severity,
        mechanism: interaction.mechanism,
        description: interaction.description,
        clinicalEffects: interaction.clinicalEffects,
        monitoring: interaction.monitoring,
        recommendation: interaction.recommendation,
        sources: interaction.sources,
        source: 'Clinical Knowledge Base',
        methodology: 'Evidence-based drug interaction database'
      };
    }
    
    return { found: false };
  }

  // Check if this is a known safe combination
  checkSafeCombination(drug1Name, drug2Name) {
    const interactionKey = this.getInteractionKey(drug1Name, drug2Name);
    const safeCombination = this.safeCombinations[interactionKey];
    
    if (safeCombination) {
      return {
        found: true,
        note: safeCombination.note,
        safety: safeCombination.safety,
        examples: safeCombination.examples,
        sources: safeCombination.sources,
        source: 'Clinical Safety Database'
      };
    }
    
    return { found: false };
  }

  // Get all interactions for a specific drug
  getAllInteractionsForDrug(drugName) {
    const normalized = this.normalizeDrugName(drugName);
    const interactions = [];
    
    for (const [key, interaction] of Object.entries(this.criticalInteractions)) {
      if (key.includes(normalized)) {
        const [drug1, drug2] = key.split('-');
        const otherDrug = drug1 === normalized ? drug2 : drug1;
        
        interactions.push({
          interactingDrug: otherDrug,
          ...interaction,
          source: 'Clinical Knowledge Base'
        });
      }
    }
    
    return interactions;
  }

  // Search for potential interactions by drug class/mechanism
  searchByMechanism(mechanism) {
    return Object.entries(this.criticalInteractions)
      .filter(([key, interaction]) => 
        interaction.mechanism.toLowerCase().includes(mechanism.toLowerCase())
      )
      .map(([key, interaction]) => ({ key, ...interaction }));
  }

  // Get statistics about the knowledge base
  getStats() {
    const total = Object.keys(this.criticalInteractions).length;
    const bySeverity = {};
    
    Object.values(this.criticalInteractions).forEach(interaction => {
      bySeverity[interaction.severity] = (bySeverity[interaction.severity] || 0) + 1;
    });
    
    return { total, bySeverity, drugsCount: Object.keys(this.drugNameMappings).length };
  }
}

export const knownInteractionsDB = new KnownInteractionsDB();
