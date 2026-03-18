import Select from '../UI/Select';

const UserFilters = ({ filters, onFilterChange, onReset }) => {
  const roleOptions = ['admin', 'manager', 'user'];
  const statusOptions = [
    { value: 'all', label: 'Tous' },
    { value: 'active', label: 'Actifs' },
    { value: 'inactive', label: 'Inactifs' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Rôle"
          value={filters.role}
          onChange={(value) => onFilterChange('role', value)}
          options={roleOptions}
          placeholder="Tous les rôles"
        />

        <Select
          label="Statut"
          value={filters.status}
          onChange={(value) => onFilterChange('status', value)}
          options={statusOptions.map(opt => opt.value)}
          optionLabels={statusOptions.reduce((acc, opt) => {
            acc[opt.value] = opt.label;
            return acc;
          }, {})}
          placeholder="Tous"
        />

        <div className="flex items-end">
          <input
            type="text"
            placeholder="Rechercher..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>
    </div>
  );
};

export default UserFilters;