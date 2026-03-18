import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/admin';
import { useToast } from '../context/ToastContext';

export const useAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  const { success, error: showError } = useToast();

  const [filters, setFilters] = useState({
    role: null,
    status: 'all',
    search: ''
  });

  // UNE SEULE VERSION DE loadUsers (La nouvelle qui calcule les stats)
  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        skip: (page - 1) * 20,
        limit: 20,
        only_active: filters.status === 'all' ? undefined : filters.status === 'active'
      };

      const data = await adminService.getUsers(params);
      setUsers(data);
      
      // Calcul des stats en local pour éviter l'erreur 404 du backend
      if (data) {
        setStats({
          total_users: data.length,
          active_users: data.filter(u => u.is_active).length,
          admin_count: data.filter(u => u.role === 'admin').length,
          manager_count: data.filter(u => u.role === 'manager').length
        });
      }

      setPagination({
        currentPage: page,
        totalPages: Math.ceil(data.length / 20) || 1,
        total: data.length
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur chargement utilisateurs');
      showError('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  }, [filters.status, showError]);

  const createUser = useCallback(async (userData) => {
    try {
      const newUser = await adminService.createUser(userData);
      await loadUsers();
      success(`Utilisateur ${newUser.display_name} créé`);
      return { success: true, user: newUser };
    } catch (err) {
      const message = err.response?.data?.detail || 'Erreur création';
      showError(message);
      return { success: false, error: message };
    }
  }, [loadUsers, success, showError]);

  const updateUser = useCallback(async (userId, userData) => {
    try {
      const updated = await adminService.updateUser(userId, userData);
      await loadUsers();
      success(`Utilisateur ${updated.display_name} modifié`);
      return { success: true, user: updated };
    } catch (err) {
      const message = err.response?.data?.detail || 'Erreur modification';
      showError(message);
      return { success: false, error: message };
    }
  }, [loadUsers, success, showError]);

  const toggleUserActive = useCallback(async (user) => {
    try {
      if (user.is_active) {
        await adminService.deactivateUser(user.id);
        success(`${user.display_name} désactivé`);
      } else {
        await adminService.reactivateUser(user.id);
        success(`${user.display_name} réactivé`);
      }
      await loadUsers();
    } catch (err) {
      showError(err.response?.data?.detail || 'Erreur');
    }
  }, [loadUsers, success, showError]);

  const filteredUsers = users.filter(user => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        user.display_name?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users: filteredUsers,
    allUsers: users,
    loading,
    error,
    stats,
    pagination,
    filters,
    setFilters: (key, value) => setFilters(prev => ({ ...prev, [key]: value })),
    loadUsers,
    createUser,
    updateUser,
    toggleUserActive
  };
};