const Pagination = ({ currentPage, totalPages, onPageChange, siblingCount = 1 }) => {
  const generatePages = () => {
    const pages = [];
    
    // Toujours afficher la première page
    pages.push(1);
    
    // Calculer la plage autour de la page courante
    const start = Math.max(2, currentPage - siblingCount);
    const end = Math.min(totalPages - 1, currentPage + siblingCount);
    
    // Ajouter les points de suspension si nécessaire
    if (start > 2) {
      pages.push('...');
    }
    
    // Ajouter les pages intermédiaires
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Ajouter les points de suspension si nécessaire
    if (end < totalPages - 1) {
      pages.push('...');
    }
    
    // Toujours afficher la dernière page si > 1
    if (totalPages > 1) {
      pages.push(totalPages);
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2">
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        ←
      </button>
      
      {/* Pages */}
      {generatePages().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...'}
          className={`px-3 py-1 rounded-md ${
            page === currentPage
              ? 'bg-indigo-600 text-white'
              : page === '...'
              ? 'cursor-default'
              : 'border border-gray-300 hover:bg-gray-50'
          }`}
        >
          {page}
        </button>
      ))}
      
      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        →
      </button>
    </div>
  );
};

export default Pagination;