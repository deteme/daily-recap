import { useState, useEffect } from 'react';
import { managerService } from '../services/manager';
import { useAuth } from './useAuth';

export const useManager = () => {
  const { isManager } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [projectReports, setProjectReports] = useState([]);

  // Charger la vue d'ensemble
  const loadDashboard = async () => {
    if (!isManager()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await managerService.getDashboardOverview();
      setDashboard(data);
      setProjects(data.managed_projects || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur chargement dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Charger les projets (si besoin séparément)
  const loadProjects = async () => {
    if (!isManager()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await managerService.getManagedProjects();
      setProjects(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur chargement projets');
    } finally {
      setLoading(false);
    }
  };

  // Charger les détails d'un projet
  const loadProjectDetails = async (projectId) => {
    if (!isManager()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Charger en parallèle
      const [stats, members, reports] = await Promise.all([
        managerService.getProjectStats(projectId),
        managerService.getProjectMembersWithStats(projectId),
        managerService.getProjectReports(projectId, { limit: 20 })
      ]);
      
      setProjectStats(stats);
      setProjectMembers(members);
      setProjectReports(reports);
      
      // Trouver le projet dans la liste
      const project = projects.find(p => p.id === projectId);
      setCurrentProject(project);
      
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur chargement projet');
    } finally {
      setLoading(false);
    }
  };

  // Charger les rapports avec filtres
  const loadProjectReportsWithFilters = async (projectId, filters) => {
    try {
      const data = await managerService.getProjectReports(projectId, filters);
      setProjectReports(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur chargement rapports');
      return [];
    }
  };

  // Rafraîchir les données
  const refreshProject = async (projectId) => {
    if (currentProject?.id === projectId) {
      await loadProjectDetails(projectId);
    }
  };

  useEffect(() => {
    if (isManager()) {
      loadDashboard();
    }
  }, [isManager]);

  return {
    loading,
    error,
    dashboard,
    projects,
    currentProject,
    projectStats,
    projectMembers,
    projectReports,
    loadDashboard,
    loadProjects,
    loadProjectDetails,
    loadProjectReportsWithFilters,
    refreshProject,
  };
};