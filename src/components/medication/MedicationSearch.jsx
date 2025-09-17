import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
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
        top: rect.bottom - 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside or scrolling (but not inside dropdown)
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    }

    function handleScroll(event) {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

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
      parts.push('Indian');
      if (medication.genericName) {
        parts.push(medication.genericName);
      }
    } else {
      parts.push('International');
      if (medication.tty) {
        const ttyMap = {
          'SCD': 'Clinical Drug',
          'SBD': 'Branded Drug'
        };
        parts.push(ttyMap[medication.tty] || medication.tty);
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
      {/* Clean Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Search medications..."
          className="
            w-full h-12
            pl-10 pr-10
            text-base
            bg-white
            border border-gray-200
            rounded-xl
            focus:border-gray-900 focus:ring-0 focus:outline-none
            transition-colors duration-200
            placeholder:text-gray-400
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
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Minimal Dropdown */}
      {isDropdownOpen && searchTerm.length >= 2 && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ inset: 0 }}
        >
          <div 
            className="
              absolute bg-white border border-gray-200 rounded-xl shadow-lg
              max-h-80 overflow-hidden pointer-events-auto
            "
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Searching...</p>
              </div>
            ) : searchResults?.length > 0 ? (
              <div className="overflow-y-auto max-h-80">
                {searchResults.map((medication, index) => (
                  <button
                    key={`${medication.rxcui}-${index}`}
                    onClick={() => handleSelectMedication(medication)}
                    className={`
                      w-full text-left p-4 
                      transition-colors duration-150
                      border-b border-gray-50 last:border-b-0
                      ${index === selectedIndex 
                        ? 'bg-gray-50' 
                        : 'hover:bg-gray-25'
                      }
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate mb-1">
                          {formatMedicationName(medication)}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {getMedicationSubtext(medication)}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-5 h-5 border border-gray-300 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-900 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">No results found</p>
                <p className="text-xs text-gray-400">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">Unable to search medications</p>
        </div>
      )}
    </div>
  );
}