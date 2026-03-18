import { useNavigate } from 'react-router-dom';
import Card from '../UI/Card';
import ActivityBadge from './ActivityBadge';
import DifficultyBadge from './DifficultyBadge';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  
  const {
    id,
    name,
    description,
    member_count,
    report_count,
    difficulty_count,
    last_report_date,
    has_recent_activity = report_count > 0 // Fallback si l'API ne le fournit pas
  } = project;

  const handleClick = () => {
    navigate(`/manager/projects/${id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleClick}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-600 line-clamp-2">{description}</p>
          )}
        </div>
        <ActivityBadge active={has_recent_activity} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Membres</p>
          <p className="text-lg font-semibold">{member_count}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Rapports (7j)</p>
          <p className="text-lg font-semibold">{report_count}</p>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between">
        <DifficultyBadge count={difficulty_count} />
        {last_report_date && (
          <p className="text-xs text-gray-500">
            Dernier: {new Date(last_report_date).toLocaleDateString()}
          </p>
        )}
      </div>
    </Card>
  );
};

export default ProjectCard;