export const API_ENDPOINTS = {
    RXNORM: {
      SEARCH: '/drugs.json',
      SPELLING: '/spellingsuggestions.json',
      APPROXIMATE: '/approximateTerm.json'
    },
    RXNAV: {
      INTERACTIONS: '/interaction/interaction.json',
      LIST: '/interaction/list.json'
    },
    OPENFDA: {
      DRUGS: '/drug/label.json',
      EVENTS: '/drug/event.json'
    }
  };
  
  export const INTERACTION_SEVERITY = {
    MAJOR: 'major',
    MODERATE: 'moderate',
    MINOR: 'minor',
    UNKNOWN: 'unknown'
  };
  
  export const SEVERITY_COLORS = {
    [INTERACTION_SEVERITY.MAJOR]: 'danger',
    [INTERACTION_SEVERITY.MODERATE]: 'warning',
    [INTERACTION_SEVERITY.MINOR]: 'primary',
    [INTERACTION_SEVERITY.UNKNOWN]: 'gray'
  };