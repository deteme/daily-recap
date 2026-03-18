import api from './api';

export const reportsService = {
  // Créer un rapport
  async createReport(reportData) {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  // Récupérer mes rapports
  async getMyReports(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.skip) queryParams.append('skip', params.skip);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.from_date) queryParams.append('from_date', params.from_date);
    if (params.to_date) queryParams.append('to_date', params.to_date);

    const response = await api.get(`/reports/me?${queryParams}`);
    return response.data;
  },

  // Récupérer un rapport spécifique
  async getReport(reportId) {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  },

  // Modifier un rapport
  async updateReport(reportId, reportData) {
    const response = await api.put(`/reports/${reportId}`, reportData);
    return response.data;
  },

  // Supprimer un rapport
  async deleteReport(reportId) {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  }
};