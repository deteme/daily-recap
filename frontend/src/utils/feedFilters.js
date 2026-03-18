/**
 * Applique tous les filtres à la liste des rapports
 */
export const applyFilters = (reports, filters) => {
  if (!reports || reports.length === 0) return [];
  
  return reports.filter(report => {
    // Filtre projet
    if (filters.project && report.project_names) {
      if (!report.project_names.includes(filters.project)) {
        return false;
      }
    }
    
    // Filtre utilisateur (auteur ou tagué)
    if (filters.user) {
      const matchesAuthor = report.user_display_name === filters.user;
      const matchesTagged = report.tagged_users?.includes(filters.user);
      if (!matchesAuthor && !matchesTagged) {
        return false;
      }
    }
    
    // Filtre difficultés
    if (filters.hasDifficulties && !report.has_difficulties) {
      return false;
    }
    
    // Filtre recherche texte
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const contentMatch = report.content_preview?.toLowerCase().includes(searchLower);
      const difficultiesMatch = report.difficulties?.toLowerCase().includes(searchLower);
      if (!contentMatch && !difficultiesMatch) {
        return false;
      }
    }
    
    // Filtre date range
    if (filters.dateRange) {
      const reportDate = new Date(report.report_date);
      const from = filters.dateRange.from ? new Date(filters.dateRange.from) : null;
      const to = filters.dateRange.to ? new Date(filters.dateRange.to) : null;
      
      if (from && reportDate < from) return false;
      if (to && reportDate > to) return false;
    }
    
    return true;
  });
};

/**
 * Groupe les rapports par date
 */
export const groupByDate = (reports) => {
  const groups = {};
  
  reports.forEach(report => {
    const date = report.report_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(report);
  });
  
  // Trier les dates (plus récentes d'abord)
  return Object.keys(groups)
    .sort((a, b) => new Date(b) - new Date(a))
    .map(date => ({
      date,
      reports: groups[date]
    }));
};

/**
 * Statistiques rapides sur le feed
 */
export const getFeedStats = (reports) => {
  const total = reports.length;
  const withDifficulties = reports.filter(r => r.has_difficulties).length;
  
  // Compter par projet
  const projectCounts = {};
  reports.forEach(report => {
    report.project_names?.forEach(project => {
      projectCounts[project] = (projectCounts[project] || 0) + 1;
    });
  });
  
  // Compter par utilisateur
  const userCounts = {};
  reports.forEach(report => {
    userCounts[report.user_display_name] = (userCounts[report.user_display_name] || 0) + 1;
  });
  
  return {
    total,
    withDifficulties,
    projectCounts,
    userCounts
  };
};