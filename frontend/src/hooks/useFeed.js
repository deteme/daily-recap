import { useState, useEffect, useCallback, useMemo } from 'react';
import { feedService } from '../services/feed';
import { useAuth } from './useAuth';
import { applyFilters } from '../utils/feedFilters';

export const useFeed = () => {
  const { user } = useAuth();
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // État des filtres
  const [filters, setFilters] = useState({
    project: null,          // Nom du projet
    user: null,             // Nom de l'utilisateur
    hasDifficulties: false, // true/false
    search: '',             // Recherche texte
    dateRange: null         // { from, to }
  });

  // Charger les données
  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await feedService.getFeed();
      setAllReports(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur chargement du feed');
    } finally {
      setLoading(false);
    }
  }, []);

  // Appliquer les filtres (côté front)
  const filteredReports = useMemo(() => {
    return applyFilters(allReports, filters);
  }, [allReports, filters]);

  // Mettre à jour un filtre
  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      project: null,
      user: null,
      hasDifficulties: false,
      search: '',
      dateRange: null
    });
  }, []);

  // Extraire tous les projets uniques du feed
  const availableProjects = useMemo(() => {
    const projects = new Set();
    allReports.forEach(report => {
      report.project_names?.forEach(name => projects.add(name));
    });
    return Array.from(projects).sort();
  }, [allReports]);

  // Extraire tous les utilisateurs uniques du feed
  const availableUsers = useMemo(() => {
    const users = new Set();
    allReports.forEach(report => {
      users.add(report.user_display_name);
      report.tagged_users?.forEach(name => users.add(name));
    });
    return Array.from(users).sort();
  }, [allReports]);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  return {
    // Données
    allReports,
    filteredReports,
    loading,
    error,
    
    // Filtres
    filters,
    setFilter,
    resetFilters,
    
    // Options pour les filtres
    availableProjects,
    availableUsers,
    
    // Actions
    refresh: loadFeed
  };
};