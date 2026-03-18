import Card from '../UI/Card';

const StatCard = ({ title, value, icon, color = 'indigo', trend, trendLabel }) => {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
  };

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 truncate">
            {title}
          </p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">
            {value}
          </p>
          {trend !== undefined && (
            <p className="mt-2 text-sm text-gray-600">
              <span className={trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : ''}>
                {trend > 0 ? '↑' : trend < 0 ? '↓' : '→'} {Math.abs(trend)}%
              </span>
              {trendLabel && ` ${trendLabel}`}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;