import { useEffect } from 'react';
import { useManager } from '../../hooks/useManager';
import { useAuth } from '../../hooks/useAuth';
import StatCard from '../../components/Dashboard/StatCard';
import ProjectCard from '../../components/Dashboard/ProjectCard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';

const ManagerDashboardPage = () => {
  const { user } = useAuth();
  const { loading, error, dashboard, projects, loadDashboard } = useManager();

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Icônes pour les stat cards
  const Icons = {
    projects: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    members: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    reports: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    difficulties: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.display_name}
        </h1>
        <p className="text-gray-600">
          Voici un résumé de votre activité des 7 derniers jours
        </p>
      </div>

      {/* Cartes de statistiques */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Projets gérés"
            value={dashboard.total_projects || 0}
            icon={Icons.projects}
            color="indigo"
          />
          <StatCard
            title="Membres d'équipe"
            value={dashboard.total_members || 0}
            icon={Icons.members}
            color="green"
          />
          <StatCard
            title="Rapports (7j)"
            value={dashboard.total_reports_week || 0}
            icon={Icons.reports}
            color="blue"
          />
          <StatCard
            title="Difficultés"
            value={dashboard.pending_difficulties || 0}
            icon={Icons.difficulties}
            color="red"
          />
        </div>
      )}

      {/* Liste des projets */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Vos projets
        </h2>
        
        {projects.length === 0 ? (
          <p className="text-gray-500">Aucun projet pour le moment</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      {/* Rapports récents */}
      {dashboard?.recent_reports?.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Rapports récents
          </h2>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {dashboard.recent_reports.map((report) => (
                <li key={report.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {report.user_display_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {report.content_preview}
                      </p>
                      <div className="mt-1 flex items-center space-x-2">
                        {report.project_names.map((name) => (
                          <span key={name} className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                            @project:{name}
                          </span>
                        ))}
                        {report.tagged_users.map((user) => (
                          <span key={user} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            @user:{user}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {new Date(report.report_date).toLocaleDateString()}
                      </p>
                      {report.has_difficulties && (
                        <span className="mt-1 inline-flex items-center px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          ⚠️ Difficulté
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboardPage;