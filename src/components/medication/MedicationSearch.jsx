import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Loader2, AlertCircle, Pill } from 'lucide-react';
import { useMedicationSearch } from '../../hooks/useMedications';
import { useMedicationContext } from '../../context/MedicationContext';

export default function MedicationSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  
  const { addMedication } = useMedicationContext();
  const { data: searchResults, isLoading, error } = useMedicationSearch(searchTerm);

  // Update dropdown position when opening
  useEffect(() => {
    if (isDropdownOpen && searchRef.current) {
      const rect = searchRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom - 4, // Remove window.scrollY for fixed positioning
        left: rect.left,      // Remove window.scrollX for fixed positioning
        width: rect.width
      });
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside or scrolling
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    }

    function handleScroll() {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true); // Capture scroll events
    window.addEventListener('resize', handleScroll); // Close on resize too

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isDropdownOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isDropdownOpen || !searchResults?.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectMedication(searchResults[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsDropdownOpen(value.length >= 2);
    setSelectedIndex(-1);
  };

  const handleSelectMedication = (medication) => {
    addMedication(medication);
    setSearchTerm('');
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    searchRef.current?.focus();
  };

  const formatMedicationName = (medication) => {
    return medication.name || medication.synonym || 'Unknown medication';
  };

  const getMedicationSubtext = (medication) => {
    const parts = [];
    
    if (medication.isIndianMedicine) {
      // Handle Indian medicine data
      if (medication.manufacturer_name) {
        parts.push(medication.manufacturer_name);
      }
      if (medication.genericName) {
        parts.push(`Generic: ${medication.genericName}`);
      }
      if (medication.formattedPrice) {
        parts.push(medication.formattedPrice);
      }
    } else {
      // Handle US/RxNorm data
      if (medication.tty) {
        const ttyMap = {
          'SCD': 'Clinical Drug',
          'SBD': 'Branded Drug',
          'GPCK': 'Generic Pack',
          'BPCK': 'Branded Pack'
        };
        parts.push(ttyMap[medication.tty] || medication.tty);
      }
      if (medication.rxcui) {
        parts.push(`RxCUI: ${medication.rxcui}`);
      }
    }
    
    return parts.join(' • ');
  };
  
    const handleInputFocus = () => {
    if (searchTerm.length >= 2) {
      setIsDropdownOpen(true);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Input Container */}
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
          {isLoading ? (
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </div>
        
        {/* Input Field - Mobile optimized */}
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Search medications (e.g., aspirin, lisinopril)..."
          className="
            w-full h-12 sm:h-14
            pl-12 pr-4
            text-sm sm:text-base
            bg-gray-50 border border-gray-200
            rounded-xl
            focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-50
            transition-all duration-200 ease-in-out
            placeholder:text-gray-400
            shadow-sm
          "
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsDropdownOpen(false);
              searchRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-3 flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Search Error</p>
            <p className="text-sm text-red-500 mt-1">Unable to search medications. Please check your connection and try again.</p>
          </div>
        </div>
      )}

      {/* Search Results Dropdown - Fixed portal positioning */}
      {isDropdownOpen && searchTerm.length >= 2 && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ inset: 0 }}
        >
          <div 
            className="
              absolute bg-white border border-gray-200 rounded-xl shadow-2xl
              max-h-80 overflow-hidden pointer-events-auto
              backdrop-blur-sm
            "
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            {isLoading ? (
              <div className="p-6 text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500 mb-3" />
                <p className="text-sm text-gray-600">Searching medications...</p>
              </div>
            ) : searchResults?.length > 0 ? (
              <div className="overflow-y-auto max-h-80">
                {searchResults.map((medication, index) => (
                  <button
                    key={`${medication.rxcui}-${index}`}
                    onClick={() => handleSelectMedication(medication)}
                    className={`
                      w-full text-left p-4 
                      transition-all duration-150 ease-in-out
                      border-b border-gray-50 last:border-b-0
                      ${index === selectedIndex 
                        ? 'bg-blue-50 border-blue-100' 
                        : 'hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        {/* Medication Icon */}
                        <div className={`
                          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5
                          ${index === selectedIndex ? 'bg-blue-100' : 'bg-gray-100'}
                        `}>
                          <Pill className={`w-4 h-4 ${index === selectedIndex ? 'text-blue-600' : 'text-gray-500'}`} />
                        </div>
                        
                        {/* Medication Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                            {formatMedicationName(medication)}
                          </p>
                          {getMedicationSubtext(medication) && (
                            <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                              {getMedicationSubtext(medication)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Add Button */}
                      <div className="flex-shrink-0 ml-3">
                        <div className={`
                          w-6 h-6 rounded-full flex items-center justify-center transition-colors
                          ${index === selectedIndex 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-500'
                          }
                        `}>
                          <Plus className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : searchTerm.length >= 2 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No medications found</p>
                <p className="text-sm text-gray-500">
                  Try searching for "{searchTerm}" using:
                </p>
                <div className="mt-2 text-xs text-gray-400 space-y-1">
                  <p>• Generic names (aspirin, ibuprofen)</p>
                  <p>• Brand names (Tylenol, Advil)</p>
                  <p>• Check spelling and try shorter terms</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Search Hints - Mobile friendly */}
      {!searchTerm && (
        <div className="mt-3 flex flex-wrap gap-2">
          {['aspirin', 'lisinopril', 'metformin', 'tylenol'].map((hint) => (
            <button
              key={hint}
              onClick={() => {
                setSearchTerm(hint);
                setIsDropdownOpen(true);
                searchRef.current?.focus();
              }}
              className="px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors border border-blue-100"
            >
              Try "{hint}"
            </button>
          ))}
        </div>
      )}
    </div>
  );
}