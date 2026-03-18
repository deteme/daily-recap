import { useState, useEffect, useRef } from 'react';
import { useAutocomplete } from '../../hooks/useAutocomplete';

const TagAutocomplete = ({ 
  inputRef, 
  onSelect, 
  projectContext = null,
  triggerChar = '@' 
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const { suggestions, loading, search } = useAutocomplete();
  const containerRef = useRef(null);

  // Détecter quand l'utilisateur tape @
  useEffect(() => {
    const handleInput = () => {
      if (!inputRef.current) return;

      const text = inputRef.current.value;
      const cursorPos = inputRef.current.selectionStart;
      
      // Chercher le dernier @ avant le curseur
      const lastAtIndex = text.lastIndexOf('@', cursorPos - 1);
      
      if (lastAtIndex !== -1 && lastAtIndex < cursorPos) {
        // Extraire le texte après @ jusqu'au curseur
        const afterAt = text.substring(lastAtIndex + 1, cursorPos);
        
        // Vérifier qu'il n'y a pas d'espace (sinon c'est la fin du tag)
        if (!afterAt.includes(' ')) {
          setSearchTerm(afterAt);
          setIsOpen(true);
          
          // Calculer la position pour la popup
          const rect = inputRef.current.getBoundingClientRect();
          const lineHeight = 20; // Approximatif
          const lines = text.substring(0, cursorPos).split('\n').length;
          
          setPosition({
            top: rect.top + window.scrollY + (lines * lineHeight) + 20,
            left: rect.left + window.scrollX + 10
          });
          
          // Lancer la recherche
          search(afterAt, projectContext);
          return;
        }
      }
      
      setIsOpen(false);
    };

    const input = inputRef.current;
    if (input) {
      input.addEventListener('input', handleInput);
      input.addEventListener('keydown', handleKeyDown);
      input.addEventListener('click', handleInput);
      input.addEventListener('scroll', handleInput);
    }

    return () => {
      if (input) {
        input.removeEventListener('input', handleInput);
        input.removeEventListener('keydown', handleKeyDown);
        input.removeEventListener('click', handleInput);
        input.removeEventListener('scroll', handleInput);
      }
    };
  }, [inputRef, search, projectContext]);

  // Gestion des touches
  const handleKeyDown = (e) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Sélectionner une suggestion
  const handleSelect = (item) => {
    if (!inputRef.current) return;

    const text = inputRef.current.value;
    const cursorPos = inputRef.current.selectionStart;
    const lastAtIndex = text.lastIndexOf('@', cursorPos - 1);
    
    // Remplacer @xxx par le tag formaté
    const prefix = text.substring(0, lastAtIndex);
    const suffix = text.substring(cursorPos);
    const tag = item.type === 'project' 
      ? `@project:${item.name} `
      : `@user:${item.name} `;
    
    inputRef.current.value = prefix + tag + suffix;
    
    // Repositionner le curseur après le tag
    const newPos = prefix.length + tag.length;
    inputRef.current.setSelectionRange(newPos, newPos);
    
    setIsOpen(false);
    if (onSelect) onSelect(item);
  };

  if (!isOpen || suggestions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-md"
      style={{ top: position.top, left: position.left }}
    >
      {loading && (
        <div className="p-4 text-center">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      )}
      
      {!loading && (
        <ul className="py-1 max-h-60 overflow-y-auto">
          {suggestions.map((item, index) => (
            <li
              key={`${item.type}-${item.id}`}
              className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 ${
                index === selectedIndex ? 'bg-indigo-100' : ''
              }`}
              onClick={() => handleSelect(item)}
            >
              <div className="flex items-center space-x-2">
                <span className="text-lg">
                  {item.type === 'project' ? '📁' : '👤'}
                </span>
                <div>
                  <span className="font-medium">{item.name}</span>
                  {item.type === 'project' && (
                    <span className="ml-2 text-xs text-gray-500">projet</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TagAutocomplete;