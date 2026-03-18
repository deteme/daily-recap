import React, { useEffect, useState } from 'react';
import { useFeed } from '../../hooks/useFeed';
import FeedFilters from '../../components/Feed/FeedFilters';
import FeedSearch from '../../components/Feed/FeedSearch';
import FeedStats from '../../components/Feed/FeedStats';
import ReportList from '../../components/Reports/ReportList';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import { getFeedStats, groupByDate } from '../../utils/feedFilters';

const FeedPage = () => {
  const {
    filteredReports,
    loading,
    error,
    filters,
    setFilter,
    resetFilters,
    availableProjects,
    availableUsers,
    refresh
  } = useFeed();

  const [groupedReports, setGroupedReports] = useState([]);
  const [stats, setStats] = useState(null);

  // Mettre à jour les groupes quand les rapports filtrés changent
  useEffect(() => {
    setGroupedReports(groupByDate(filteredReports));
    setStats(getFeedStats(filteredReports));
  }, [filteredReports]);

  if (loading && filteredReports.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Fil d'actualité
        </h1>
        <button
          onClick={refresh}
          className="px-4 py-2 text-indigo-600 hover:text-indigo-900"
        >
          ↻ Actualiser
        </button>
      </div>

      {/* Barre de recherche */}
      <FeedSearch
        value={filters.search}
        onChange={(value) => setFilter('search', value)}
        placeholder="Rechercher dans les rapports..."
      />

      {/* Filtres avancés */}
      <FeedFilters
        filters={filters}
        onFilterChange={setFilter}
        onReset={resetFilters}
        availableProjects={availableProjects}
        availableUsers={availableUsers}
      />

      {/* Statistiques */}
      {stats && <FeedStats stats={stats} />}

      {/* Résultats */}
      <div className="space-y-8">
        {groupedReports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun rapport ne correspond aux filtres</p>
          </div>
        ) : (
          groupedReports.map((group) => (
            <div key={group.date}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">
                {new Date(group.date).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h2>
              <ReportList
                reports={group.reports}
                showActions={false} // Pas d'actions dans le feed
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedPage;