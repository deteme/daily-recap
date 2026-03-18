import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useManager } from '../../hooks/useManager';
import MemberPerformanceTable from '../../components/Dashboard/MemberPerformanceTable';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import Card from '../../components/UI/Card';
import DifficultyBadge from '../../components/Dashboard/DifficultyBadge';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const {
    loading,
    error,
    currentProject,
    projectStats,
    projectMembers,
    projectReports,
    loadProjectDetails,
    loadProjectReportsWithFilters
  } = useManager();

  const [filters, setFilters] = useState({
    hasDifficulties: undefined,
    search: ''
  });

  useEffect(() => {
    if (projectId) {
      loadProjectDetails(parseInt(projectId));
    }
  }, [projectId]);

  const handleFilterChange = async (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    await loadProjectReportsWithFilters(parseInt(projectId), updated);
  };

  if (loading && !currentProject) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!currentProject) {
    return <ErrorMessage message="Projet non trouvé" />;
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-indigo-600 hover:text-indigo-900"
        >
          ← Retour
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {currentProject.name}
        </h1>
        <DifficultyBadge count={currentProject.difficulty_count} />
      </div>

      {/* Description */}
      {currentProject.description && (
        <Card>
          <p className="text-gray-700">{currentProject.description}</p>
        </Card>
      )}

      {/* Stats rapides */}
      {projectStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <p className="text-sm text-gray-600">Total rapports</p>
            <p className="text-2xl font-bold">{projectStats.total_reports}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Avec difficultés</p>
            <p className="text-2xl font-bold">{projectStats.reports_with_difficulties}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600">Membres actifs</p>
            <p className="text-2xl font-bold">{projectStats.active_members}</p>
          </Card>
        </div>
      )}

      {/* Graphique activité 7 jours */}
      {projectStats?.reports_last_7_days && (
        <Card>
          <h3 className="text-lg font-semibold mb-4">Activité des 7 derniers jours</h3>
          <div className="flex items-end space-x-2 h-32">
            {projectStats.reports_last_7_days.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-indigo-200 rounded-t"
                  style={{ 
                    height: `${Math.max(8, day.count * 20)}px`,
                    backgroundColor: day.count === 0 ? '#e5e7eb' : '#818cf8'
                  }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">
                  {new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}
                </span>
                <span className="text-xs font-medium">{day.count}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tableau de performance des membres */}
      {projectMembers.length > 0 && (
        <MemberPerformanceTable members={projectMembers} />
      )}

      {/* Filtres pour les rapports */}
      <Card>
        <div className="flex space-x-4">
          <button
            onClick={() => handleFilterChange({ hasDifficulties: undefined })}
            className={`px-4 py-2 rounded-md ${
              filters.hasDifficulties === undefined
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => handleFilterChange({ hasDifficulties: true })}
            className={`px-4 py-2 rounded-md ${
              filters.hasDifficulties === true
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Avec difficultés
          </button>
          <button
            onClick={() => handleFilterChange({ hasDifficulties: false })}
            className={`px-4 py-2 rounded-md ${
              filters.hasDifficulties === false
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Sans difficultés
          </button>
        </div>
        
        <div className="mt-4">
          <input
            type="text"
            placeholder="Rechercher dans les rapports..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ search: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </Card>

      {/* Liste des rapports */}
      {projectReports.length > 0 ? (
        <div className="space-y-4">
          {projectReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{report.user_display_name}</p>
                  <p className="text-sm text-gray-600 mt-1">{report.content_preview}</p>
                  {report.difficulties && (
                    <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                      ⚠️ {report.difficulties}
                    </p>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(report.report_date).toLocaleDateString()}
                </p>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center py-8">
          Aucun rapport correspondant aux filtres
        </p>
      )}
    </div>
  );
};

export default ProjectDetailPage;