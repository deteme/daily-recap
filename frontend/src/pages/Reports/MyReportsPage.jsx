import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReports } from '../../hooks/useReports';
import ReportList from '../../components/Reports/ReportList';
import Card from '../../components/UI/Card';

const MyReportsPage = () => {
  const { reports, loading, error, loadMyReports, deleteReport } = useReports();
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState(location.state?.message);

  useEffect(() => {
    loadMyReports();
  }, [loadMyReports]);

  const handleEdit = (report) => {
    navigate(`/reports/edit/${report.id}`, { state: { report } });
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('Supprimer ce rapport ?')) {
      const result = await deleteReport(reportId);
      if (result.success) {
        setMessage('Rapport supprimé');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Mes rapports
        </h1>
        <button
          onClick={() => navigate('/reports/new')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          + Nouveau rapport
        </button>
      </div>

      {/* Message de succès */}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {message}
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <p className="text-sm text-gray-600">Total rapports</p>
          <p className="text-2xl font-bold">{reports.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Dernier rapport</p>
          <p className="text-lg font-semibold">
            {reports.length > 0 
              ? new Date(reports[0].report_date).toLocaleDateString()
              : 'Jamais'}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-600">Avec difficultés</p>
          <p className="text-2xl font-bold">
            {reports.filter(r => r.has_difficulties).length}
          </p>
        </Card>
      </div>

      {/* Liste des rapports */}
      <ReportList
        reports={reports}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        showActions={true}
        emptyMessage="Vous n'avez pas encore créé de rapport"
      />
    </div>
  );
};

export default MyReportsPage;