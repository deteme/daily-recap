import { useNavigate } from 'react-router-dom';
import Card from '../UI/Card';

const ReportCard = ({ report, onEdit, onDelete, showActions = false }) => {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleTagClick = (type, name) => {
    if (type === 'project') {
      navigate(`/feed?project=${name}`);
    } else {
      navigate(`/feed?user=${name}`);
    }
  };

  // Coloration basique des tags dans le texte
const renderContent = () => {

  if (!report.content) return null; 

  const parts = report.content.split(/(@(?:project|user):[^\s]+)/g);
  
  return parts.map((part, index) => {
    const projectMatch = part.match(/^@project:([^\s]+)$/);
    const userMatch = part.match(/^@user:([^\s]+)$/);
    
    if (projectMatch) {
      return (
        <button
          key={index}
          onClick={() => handleTagClick('project', projectMatch[1])}
          className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200 text-sm font-medium mr-1"
        >
          📁 {projectMatch[1]}
        </button>
      );
    }
    
    if (userMatch) {
      return (
        <button
          key={index}
          onClick={() => handleTagClick('user', userMatch[1])}
          className="inline-flex items-center px-2 py-0.5 rounded bg-green-100 text-green-800 hover:bg-green-200 text-sm font-medium mr-1"
        >
          👤 {userMatch[1]}
        </button>
      );
    }
    
    return <span key={index}>{part}</span>;
  });
};

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {report.user_display_name}
          </h3>
          <p className="text-sm text-gray-500">
            {formatDate(report.report_date)}
          </p>
        </div>
        
        {showActions && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit(report)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(report.id)}
              className="text-red-600 hover:text-red-900"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 text-gray-700 whitespace-pre-wrap">
        {renderContent()}
      </div>

      {report.difficulties && (
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm font-medium text-red-800 mb-1">
            ⚠️ Difficultés rencontrées :
          </p>
          <p className="text-sm text-red-700">
            {report.difficulties}
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Rapport #{report.id}
        </p>
        {report.tags && report.tags.length > 0 && (
          <p className="text-xs text-gray-500">
            {report.tags.length} tag{report.tags.length > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </Card>
  );
};

export default ReportCard;