import { useState, useCallback } from 'react';
import api from '../services/api';

export const useAutocomplete = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query, projectContext = null) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return [];
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ q: query });
      if (projectContext) {
        params.append('project_context', projectContext);
      }

      const response = await api.get(`/autocomplete?${params}`);
      setSuggestions(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur recherche');
      setSuggestions([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const searchProjects = useCallback(async (query) => {
    try {
      const response = await api.get(`/autocomplete/projects?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (err) {
      console.error('Erreur recherche projets:', err);
      return [];
    }
  }, []);

  const searchUsers = useCallback(async (query, projectId = null) => {
    try {
      const params = new URLSearchParams({ q: query });
      if (projectId) params.append('project_id', projectId);
      
      const response = await api.get(`/autocomplete/users?${params}`);
      return response.data;
    } catch (err) {
      console.error('Erreur recherche utilisateurs:', err);
      return [];
    }
  }, []);

  return {
    suggestions,
    loading,
    error,
    search,
    searchProjects,
    searchUsers
  };
};