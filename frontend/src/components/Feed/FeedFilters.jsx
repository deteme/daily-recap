import React from 'react';
import Select from '../UI/Select';

const FeedFilters = ({ 
  filters, 
  onFilterChange, 
  onReset,
  availableProjects,
  availableUsers 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Filtres
        </h3>
        <button
          onClick={onReset}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          Réinitialiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filtre projet */}
        <Select
          label="Projet"
          value={filters.project}
          onChange={(value) => onFilterChange('project', value)}
          options={availableProjects}
          placeholder="Tous les projets"
        />

        {/* Filtre utilisateur */}
        <Select
          label="Personne"
          value={filters.user}
          onChange={(value) => onFilterChange('user', value)}
          options={availableUsers}
          placeholder="Toutes les personnes"
        />

        {/* Filtre difficultés */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="hasDifficulties"
            checked={filters.hasDifficulties}
            onChange={(e) => onFilterChange('hasDifficulties', e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="hasDifficulties" className="text-sm text-gray-700">
            Uniquement les rapports avec difficultés
          </label>
        </div>

        {/* Filtre date from (optionnel) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date (à partir de)
          </label>
          <input
            type="date"
            value={filters.dateRange?.from || ''}
            onChange={(e) => onFilterChange('dateRange', { 
              ...filters.dateRange, 
              from: e.target.value 
            })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default FeedFilters;