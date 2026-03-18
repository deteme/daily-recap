const RoleBadge = ({ role }) => {
  const colors = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    user: 'bg-green-100 text-green-800'
  };

  const labels = {
    admin: 'Admin',
    manager: 'Manager',
    user: 'Utilisateur'
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
      {labels[role] || role}
    </span>
  );
};

export default RoleBadge;