import React from 'react';
import Card from '../UI/Card';

const FeedStats = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="text-center">
        <p className="text-2xl font-bold text-indigo-600">{stats.total}</p>
        <p className="text-sm text-gray-600">Total rapports</p>
      </Card>
      
      <Card className="text-center">
        <p className="text-2xl font-bold text-red-600">{stats.withDifficulties}</p>
        <p className="text-sm text-gray-600">Avec difficultés</p>
      </Card>
      
      <Card className="text-center">
        <p className="text-2xl font-bold text-green-600">
          {Object.keys(stats.projectCounts).length}
        </p>
        <p className="text-sm text-gray-600">Projets actifs</p>
      </Card>
    </div>
  );
};

export default FeedStats;