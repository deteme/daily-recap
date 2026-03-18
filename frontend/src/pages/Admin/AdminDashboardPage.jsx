import { useEffect } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { Link } from 'react-router-dom';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const AdminDashboardPage = () => {
  const { stats, loading} = useAdmin();

 

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color = 'indigo', link }) => {
    const colors = {
      indigo: 'bg-indigo-100 text-indigo-800',
      purple: 'bg-purple-100 text-purple-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800'
    };

    const content = (
      <Card className="hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colors[color]}`}>
            {icon}
          </div>
        </div>
      </Card>
    );

    if (link) {
      return <Link to={link}>{content}</Link>;
    }
    return content;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Dashboard Administration
      </h1>

      {/* Stats globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total utilisateurs"
          value={stats?.total_users || 0}
          icon={<span className="text-2xl">👥</span>}
          color="indigo"
          link="/admin/users"
        />
        <StatCard
          title="Utilisateurs actifs"
          value={stats?.active_users || 0}
          icon={<span className="text-2xl">✅</span>}
          color="green"
        />
        <StatCard
          title="Administrateurs"
          value={stats?.admins || 0}
          icon={<span className="text-2xl">👑</span>}
          color="purple"
        />
        <StatCard
          title="Managers"
          value={stats?.managers || 0}
          icon={<span className="text-2xl">📊</span>}
          color="blue"
        />
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Actions rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/admin/users/new">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-indigo-100 hover:border-indigo-300">
              <div className="text-center py-4">
                <span className="text-4xl mb-2 block">➕</span>
                <h3 className="font-semibold">Nouvel utilisateur</h3>
                <p className="text-sm text-gray-600">
                  Créer un compte
                </p>
              </div>
            </Card>
          </Link>
          
          <Link to="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center py-4">
                <span className="text-4xl mb-2 block">📋</span>
                <h3 className="font-semibold">Gérer les utilisateurs</h3>
                <p className="text-sm text-gray-600">
                  Liste, modification, désactivation
                </p>
              </div>
            </Card>
          </Link>
          
          <Card className="opacity-50">
            <div className="text-center py-4">
              <span className="text-4xl mb-2 block">📊</span>
              <h3 className="font-semibold">Rapports globaux</h3>
              <p className="text-sm text-gray-600">
                Bientôt disponible
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Info système */}
      <Card>
        <h3 className="text-lg font-semibold mb-2">Informations système</h3>
        <p className="text-sm text-gray-600">
          Application DailyRecap - Version 1.0.0
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {stats?.total_users} utilisateurs enregistrés, {stats?.active_users} actifs
        </p>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;