import api from './api';

export const managerService = {
  // Vue d'ensemble du dashboard
  async getDashboardOverview() {
    const response = await api.get('/dashboard/manager');
    return response.data;
  },

  // Liste des projets avec stats
  async getManagedProjects() {
    const response = await api.get('/dashboard/projects');
    return response.data;
  },

  // Rapports d'un projet avec filtres
  async getProjectReports(projectId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.userId) params.append('user_id', filters.userId);
    if (filters.fromDate) params.append('from_date', filters.fromDate);
    if (filters.toDate) params.append('to_date', filters.toDate);
    if (filters.hasDifficulties !== undefined) params.append('has_difficulties', filters.hasDifficulties);
    if (filters.search) params.append('search', filters.search);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await api.get(`/dashboard/projects/${projectId}/reports?${params}`);
    return response.data;
  },

  // Statistiques détaillées d'un projet
  async getProjectStats(projectId) {
    const response = await api.get(`/dashboard/projects/${projectId}/stats`);
    return response.data;
  },

  // Membres d'un projet avec leurs stats
  async getProjectMembersWithStats(projectId) {
    const response = await api.get(`/dashboard/projects/${projectId}/members`);
    return response.data;
  }
};