import api from './api';

export const feedService = {
  // Récupérer tous les rapports accessibles
  async getFeed(params = {}) {
    // Pour l'instant, on récupère via différentes endpoints selon le rôle
    // À terme, créer un endpoint /feed dédié côté back
    try {
      // Tentative d'abord via dashboard manager (si dispo)
      const response = await api.get('/dashboard/manager');
      
      // Extraire les rapports récents
      const reports = response.data?.recent_reports || [];
      return reports;
    } catch (err) {
      // Fallback: récupérer via l'historique utilisateur
      const response = await api.get('/reports/me?limit=50');
      return response.data;
    }
  },

  // Version améliorée quand le backend aura un endpoint feed
  async getFilteredFeed(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.projectId) params.append('project_id', filters.projectId);
    if (filters.userId) params.append('user_id', filters.userId);
    if (filters.fromDate) params.append('from_date', filters.fromDate);
    if (filters.toDate) params.append('to_date', filters.toDate);
    if (filters.hasDifficulties) params.append('has_difficulties', true);
    if (filters.search) params.append('search', filters.search);
    
    const response = await api.get(`/feed?${params}`);
    return response.data;
  }
};