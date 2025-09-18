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

  // Close dropdown when clicking outside or scrolling (with better mobile handling)
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
      }
    }

    let scrollTimeout;
    let isScrollingInDropdown = false;

    function handleScroll(event) {
      // Check if scroll is happening within the dropdown
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        isScrollingInDropdown = true;
        return; // Don't close if scrolling inside dropdown
      }

      // For mobile: Add delay before closing to allow for scroll momentum
      if (isDropdownOpen) {
        // Clear existing timeout
        clearTimeout(scrollTimeout);
        
        // Only close after scroll has stopped for a bit
        scrollTimeout = setTimeout(() => {
          if (!isScrollingInDropdown) {
            setIsDropdownOpen(false);
            setSelectedIndex(-1);
          }
          isScrollingInDropdown = false;
        }, 150); // 150ms delay - allows for natural scrolling
      }
    }

    function handleTouchStart() {
      // Reset the scrolling flag on touch start
      isScrollingInDropdown = false;
    }

    function handleTouchMove(event) {
      // Track if touch is happening within dropdown
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        isScrollingInDropdown = true;
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      clearTimeout(scrollTimeout);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
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
      {/* iOS-style Search Input */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <Search className="h-[18px] w-[18px] text-gray-400" />
        </div>
        
        <input
          ref={searchRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder="Search Indian medicines (e.g., Crocin, Dolo, Ayurvedic herbs)..."
          className="
            w-full h-[44px]
            pl-10 pr-10
            text-[17px] font-normal
            bg-gray-100/80
            border-0
            rounded-[22px]
            focus:bg-white focus:ring-0 focus:outline-none focus:shadow-lg
            transition-all duration-200
            placeholder:text-gray-400 placeholder:font-normal
          "
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {/* iOS-style Clear Button */}
        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm('');
              setIsDropdownOpen(false);
              searchRef.current?.focus();
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 w-[20px] h-[20px] bg-gray-400 hover:bg-gray-500 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>

      {/* iOS-style Dropdown */}
      {isDropdownOpen && searchTerm.length >= 2 && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{ inset: 0 }}
        >
          <div 
            className="
              absolute bg-white/95 backdrop-blur-xl border border-gray-200/60 rounded-[20px] shadow-2xl
              max-h-80 overflow-hidden pointer-events-auto mt-2
            "
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-[15px] text-gray-500 font-medium">Searching...</p>
              </div>
            ) : searchResults?.length > 0 ? (
              <div className="overflow-y-auto max-h-80 divide-y divide-gray-100/80">
                {searchResults.map((medication, index) => (
                  <button
                    key={`${medication.rxcui}-${index}`}
                    onClick={() => handleSelectMedication(medication)}
                    className={`
                      w-full text-left px-4 py-3 
                      transition-all duration-150
                      ${index === selectedIndex 
                        ? 'bg-gray-100/80' 
                        : 'hover:bg-gray-50/60 active:bg-gray-100/60'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-[16px] font-medium text-gray-900 truncate leading-[20px]">
                          {formatMedicationName(medication)}
                        </p>
                        <p className="text-[13px] text-gray-500 truncate mt-0.5 leading-[16px]">
                          {getMedicationSubtext(medication)}
                        </p>
                      </div>
                      
                      <div className="flex-shrink-0 ml-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-[15px] text-gray-500 font-medium mb-1">No results found</p>
                <p className="text-[13px] text-gray-400">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* iOS-style Error State */}
      {error && (
        <div className="mt-3 p-4 bg-red-50/80 border border-red-100 rounded-2xl">
          <p className="text-[15px] text-red-600 font-medium text-center">Unable to search medications</p>
        </div>
      )}
    </div>
  );
}