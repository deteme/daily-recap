import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoleBadge from './RoleBadge';
import ConfirmDialog from '../UI/ConfirmDialog';

const UserTable = ({ users, loading, onEdit, onToggleActive }) => {
  const navigate = useNavigate();
  const [userToToggle, setUserToToggle] = useState(null);

  const handleToggleClick = (user) => {
    setUserToToggle(user);
  };

  const handleConfirmToggle = () => {
    if (userToToggle) {
      onToggleActive(userToToggle);
      setUserToToggle(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date création
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.display_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    @{user.username}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.is_active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleToggleClick(user)}
                    className={`${
                      user.is_active 
                        ? 'text-red-600 hover:text-red-900' 
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {user.is_active ? 'Désactiver' : 'Réactiver'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={!!userToToggle}
        onClose={() => setUserToToggle(null)}
        onConfirm={handleConfirmToggle}
        title={userToToggle?.is_active ? 'Désactiver l\'utilisateur' : 'Réactiver l\'utilisateur'}
        message={userToToggle?.is_active 
          ? `Êtes-vous sûr de vouloir désactiver ${userToToggle?.display_name} ? Ses rapports resteront visibles mais il ne pourra plus se connecter.`
          : `Êtes-vous sûr de vouloir réactiver ${userToToggle?.display_name} ? Il pourra à nouveau se connecter.`
        }
        confirmText={userToToggle?.is_active ? 'Désactiver' : 'Réactiver'}
      />
    </>
  );
};

export default UserTable;