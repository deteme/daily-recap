import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import { adminService } from '../../services/admin';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';

const UserFormPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { createUser, updateUser } = useAdmin();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    display_name: '',
    password: '',
    role: 'user',
    is_active: true
  });

  const isEditing = !!userId;
  const userFromState = location.state?.user;

  useEffect(() => {
    if (isEditing && userFromState) {
      setFormData({
        email: userFromState.email || '',
        username: userFromState.username || '',
        display_name: userFromState.display_name || '',
        password: '', // Ne pas pré-remplir le mot de passe
        role: userFromState.role || 'user',
        is_active: userFromState.is_active !== undefined ? userFromState.is_active : true
      });
    } else if (isEditing) {
      // Charger l'utilisateur si pas dans le state
      const loadUser = async () => {
        setLoading(true);
        try {
          const user = await adminService.getUser(userId);
          setFormData({
            email: user.email,
            username: user.username,
            display_name: user.display_name,
            password: '',
            role: user.role,
            is_active: user.is_active
          });
        } catch (err) {
          setError(err.response?.data?.detail || 'Erreur chargement');
        } finally {
          setLoading(false);
        }
      };
      loadUser();
    }
  }, [isEditing, userId, userFromState]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Ne pas envoyer le mot de passe si vide en édition
    const submitData = { ...formData };
    if (isEditing && !submitData.password) {
      delete submitData.password;
    }

    let result;
    if (isEditing) {
      result = await updateUser(userId, submitData);
    } else {
      result = await createUser(submitData);
    }

    setLoading(false);

    if (result.success) {
      navigate('/admin/users');
    } else {
      setError(result.error);
    }
  };

  if (loading && isEditing && !formData.display_name) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? 'Modifier un utilisateur' : 'Créer un nouvel utilisateur'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Nom d'utilisateur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom d'utilisateur *
          </label>
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Nom affiché */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom affiché *
          </label>
          <input
            type="text"
            name="display_name"
            required
            value={formData.display_name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Mot de passe */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isEditing ? 'Mot de passe (laisser vide pour ne pas changer)' : 'Mot de passe *'}
          </label>
          <input
            type="password"
            name="password"
            required={!isEditing}
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Rôle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rôle
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="user">Utilisateur</option>
            <option value="manager">Manager</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        {/* Statut actif (visible seulement en édition) */}
        {isEditing && (
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              Compte actif
            </label>
          </div>
        )}

        {/* Message d'erreur */}
        {error && <ErrorMessage message={error} />}

        {/* Boutons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="small" />
                <span className="ml-2">Enregistrement...</span>
              </>
            ) : (
              isEditing ? 'Mettre à jour' : 'Créer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFormPage;