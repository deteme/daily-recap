import Card from '../UI/Card';

const MemberPerformanceTable = ({ members }) => {
  const [sortField, setSortField] = useState('reports_last_30_days');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedMembers = [...members].sort((a, b) => {
    let aVal = a.stats?.[sortField] || 0;
    let bVal = b.stats?.[sortField] || 0;
    
    if (sortDirection === 'asc') {
      return aVal - bVal;
    } else {
      return bVal - aVal;
    }
  });

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Performance des membres
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Membre
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reports_last_7_days')}
              >
                7 jours {getSortIcon('reports_last_7_days')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('reports_last_30_days')}
              >
                30 jours {getSortIcon('reports_last_30_days')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernier rapport
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedMembers.map((member) => {
              const lastReport = member.stats?.last_report_date 
                ? new Date(member.stats.last_report_date).toLocaleDateString()
                : 'Jamais';
              
              const weekCount = member.stats?.reports_last_7_days || 0;
              const monthCount = member.stats?.reports_last_30_days || 0;
              
              const isInactive = weekCount === 0;
              
              return (
                <tr key={member.user_id} className={isInactive ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {member.display_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {member.email}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                    weekCount === 0 ? 'font-bold text-red-600' : 'text-gray-900'
                  }`}>
                    {weekCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {monthCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {lastReport}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isInactive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Inactif
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Actif
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default MemberPerformanceTable;