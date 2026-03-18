import ReportCard from './ReportCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

const ReportList = ({ 
  reports, 
  loading, 
  error, 
  onEdit, 
  onDelete, 
  showActions = false,
  emptyMessage = "Aucun rapport pour le moment"
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reports.map((report) => (
        <ReportCard
          key={report.id}
          report={report}
          onEdit={onEdit}
          onDelete={onDelete}
          showActions={showActions}
        />
      ))}
    </div>
  );
};

export default ReportList;