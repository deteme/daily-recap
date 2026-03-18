const ActivityBadge = ({ active, text = '' }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      active 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      <span className={`w-2 h-2 mr-1 rounded-full ${
        active ? 'bg-green-500' : 'bg-gray-400'
      }`}></span>
      {text || (active ? 'Actif' : 'Silence')}
    </span>
  );
};

export default ActivityBadge;