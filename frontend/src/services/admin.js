import api from './api';

export const adminService = {
  // Récupérer tous les utilisateurs
  async getUsers(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.only_active !== undefined) queryParams.append('only_active', params.only_active);
    
    const response = await api.get(`/users?${queryParams}`);
    return response.data;
  },

  // Récupérer un utilisateur
  async getUser(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  // Créer un utilisateur
  async createUser(userData) {
    const response = await api.post('/users', userData);
    return response.data;
  },

  // Mettre à jour un utilisateur
  async updateUser(userId, userData) {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  // Désactiver un utilisateur
  async deactivateUser(userId) {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Réactiver un utilisateur
  async reactivateUser(userId) {
    const response = await api.post(`/users/${userId}/reactivate`);
    return response.data;
  },

  // Stats globales (si endpoint dispo)
  async getGlobalStats() {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (err) {
      // Fallback: calculer à partir des users
      const users = await this.getUsers({ limit: 1000 });
      return {
        total_users: users.length,
        active_users: users.filter(u => u.is_active).length,
        admins: users.filter(u => u.role === 'admin').length,
        managers: users.filter(u => u.role === 'manager').length,
        users: users.filter(u => u.role === 'user').length
      };
    }
  }
};