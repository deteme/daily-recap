import { useState, useEffect, useCallback } from 'react';
import { reportsService } from '../services/reports';
import { useAuth } from './useAuth';

export const useReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  // Charger mes rapports
  const loadMyReports = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const data = await reportsService.getMyReports(params);
      setReports(data);
      setTotal(data.length); // À améliorer avec pagination côté back
      return data;
    } catch (err) {
      setError(err.response?.data?.detail || 'Erreur chargement rapports');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Créer un rapport
  const createReport = useCallback(async (reportData) => {
    setLoading(true);
    setError(null);

    try {
      const newReport = await reportsService.createReport(reportData);
      // Recharger la liste ou ajouter le nouveau rapport
      await loadMyReports();
      return { success: true, report: newReport };
    } catch (err) {
      const message = err.response?.data?.detail || 'Erreur création rapport';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [loadMyReports]);

  // Mettre à jour un rapport
  const updateReport = useCallback(async (reportId, reportData) => {
    setLoading(true);
    setError(null);

    try {
      const updated = await reportsService.updateReport(reportId, reportData);
      await loadMyReports();
      return { success: true, report: updated };
    } catch (err) {
      const message = err.response?.data?.detail || 'Erreur modification rapport';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [loadMyReports]);

  // Supprimer un rapport
  const deleteReport = useCallback(async (reportId) => {
    setLoading(true);
    setError(null);

    try {
      await reportsService.deleteReport(reportId);
      await loadMyReports();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Erreur suppression rapport';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, [loadMyReports]);

  // Vérifier si une date est valide (dans les 7 derniers jours)
  const isValidReportDate = useCallback((date) => {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const checkDate = new Date(date);
    return checkDate >= sevenDaysAgo && checkDate <= today;
  }, []);

  // Obtenir la date par défaut (aujourd'hui)
  const getDefaultDate = useCallback(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  useEffect(() => {
    if (user) {
      loadMyReports();
    }
  }, [user, loadMyReports]);

  return {
    reports,
    loading,
    error,
    total,
    createReport,
    updateReport,
    deleteReport,
    loadMyReports,
    isValidReportDate,
    getDefaultDate
  };
};