import React, { useState, useRef, useEffect } from 'react';

const Select = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Sélectionner...',
  label,
  className = '',
  clearable = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer flex items-center justify-between hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className={`${!value ? 'text-gray-400' : 'text-gray-900'}`}>
          {value || placeholder}
        </span>
        
        <div className="flex items-center space-x-2">
          {value && clearable && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-gray-500 text-sm">
              Aucune option
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option}
                onClick={() => handleSelect(option)}
                className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                  option === value ? 'bg-indigo-100 text-indigo-700' : 'text-gray-900'
                }`}
              >
                {option}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Select;