import { useAuth } from '../../hooks/useAuth';
import { useReports } from '../../hooks/useReports';
import { Link } from 'react-router-dom';
import Card from '../../components/UI/Card';
import ReportList from '../../components/Reports/ReportList';

const UserDashboardPage = () => {
  const { user } = useAuth();
  const { reports, loading, error } = useReports();

  // Prendre les 5 derniers rapports
  const recentReports = reports.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.display_name}
        </h1>
        <p className="text-gray-600">
          Bienvenue sur votre espace personnel
        </p>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/reports/new">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-100 hover:border-indigo-300">
            <div className="text-center py-4">
              <span className="text-4xl mb-2 block">📝</span>
              <h3 className="text-lg font-semibold">Nouveau rapport</h3>
              <p className="text-sm text-gray-600">
                Remplir mon rapport du jour
              </p>
            </div>
          </Card>
        </Link>
        
        <Link to="/reports">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-center py-4">
              <span className="text-4xl mb-2 block">📚</span>
              <h3 className="text-lg font-semibold">Mes rapports</h3>
              <p className="text-sm text-gray-600">
                Voir mon historique
              </p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Rapports récents */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Rapports récents
          </h2>
          <Link to="/reports" className="text-indigo-600 hover:text-indigo-900">
            Voir tout →
          </Link>
        </div>

        <ReportList
          reports={recentReports}
          loading={loading}
          error={error}
          emptyMessage="Vous n'avez pas encore de rapports"
        />
      </div>
    </div>
  );
};

export default UserDashboardPage;