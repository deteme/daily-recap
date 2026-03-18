import { useState, useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import UserTable from '../../components/Admin/UserTable';
import UserFilters from '../../components/Admin/UserFilters';
import Pagination from '../../components/UI/Pagination';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import { Link } from 'react-router-dom';

const UsersListPage = () => {
  const {
    users,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    loadUsers,
    toggleUserActive
  } = useAdmin();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadUsers(currentPage);
  }, [loadUsers, currentPage, filters.status]); // Recharger quand les filtres changent

  const handleFilterChange = (key, value) => {
    setFilters(key, value);
    setCurrentPage(1); // Retour à la première page
  };

  const handleResetFilters = () => {
    setFilters('role', null);
    setFilters('status', 'all');
    setFilters('search', '');
    setCurrentPage(1);
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Gestion des utilisateurs
        </h1>
        <Link
          to="/admin/users/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Nouvel utilisateur
        </Link>
      </div>

      {/* Filtres */}
      <UserFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      {/* Tableau */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="large" />
        </div>
      ) : (
        <>
          <UserTable
            users={users}
            onEdit={(user) => {}} // Géré par navigation dans le composant
            onToggleActive={toggleUserActive}
          />

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsersListPage;