import { useState, useRef, useEffect } from 'react';
import { useReports } from '../../hooks/useReports';
import { useAuth } from '../../hooks/useAuth';
import TagAutocomplete from './TagAutocomplete';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';

const ReportForm = ({ onSuccess, initialData = null, isEditing = false }) => {
  const { user } = useAuth();
  const { createReport, updateReport, isValidReportDate, getDefaultDate } = useReports();
  
  const [formData, setFormData] = useState({
    report_date: getDefaultDate(),
    content: '',
    difficulties: ''
  });
  
  const [hasDifficulties, setHasDifficulties] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projectContext, setProjectContext] = useState(null);
  
  const contentRef = useRef(null);

  // Si édition, pré-remplir
  useEffect(() => {
    if (initialData) {
      setFormData({
        report_date: initialData.report_date,
        content: initialData.content,
        difficulties: initialData.difficulties || ''
      });
      setHasDifficulties(!!initialData.difficulties);
    }
  }, [initialData]);

  // Extraire le premier projet tagué pour le contexte
  useEffect(() => {
    const extractProjectContext = () => {
      const matches = formData.content.match(/@project:([^\s]+)/g);
      if (matches && matches.length > 0) {
        // Prendre le premier projet trouvé
        const projectName = matches[0].replace('@project:', '');
        setProjectContext(projectName);
      } else {
        setProjectContext(null);
      }
    };
    
    extractProjectContext();
  }, [formData.content]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDifficultyChange = (e) => {
    setHasDifficulties(e.target.checked);
    if (!e.target.checked) {
      setFormData(prev => ({ ...prev, difficulties: '' }));
    }
  };

  const validateForm = () => {
    if (!formData.report_date) {
      setError('La date est requise');
      return false;
    }

    if (!isValidReportDate(formData.report_date)) {
      setError('La date doit être dans les 7 derniers jours');
      return false;
    }

    if (!formData.content.trim()) {
      setError('Le contenu du rapport est requis');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    // Préparer les données
    const submitData = {
      report_date: formData.report_date,
      content: formData.content.trim(),
      difficulties: hasDifficulties ? formData.difficulties.trim() : ''
    };

    let result;
    if (isEditing && initialData) {
      result = await updateReport(initialData.id, submitData);
    } else {
      result = await createReport(submitData);
    }

    setLoading(false);

    if (result.success) {
      if (onSuccess) onSuccess(result.report);
      // Réinitialiser le formulaire
      setFormData({
        report_date: getDefaultDate(),
        content: '',
        difficulties: ''
      });
      setHasDifficulties(false);
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Date */}
      <div>
        <label htmlFor="report_date" className="block text-sm font-medium text-gray-700">
          Date du rapport
        </label>
        <input
          type="date"
          id="report_date"
          name="report_date"
          value={formData.report_date}
          onChange={handleChange}
          max={getDefaultDate()}
          min={new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          disabled={loading}
        />
        <p className="mt-1 text-xs text-gray-500">
          Vous pouvez saisir un rapport pour aujourd'hui ou les 6 jours précédents
        </p>
      </div>

      {/* Contenu avec tags */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Qu'avez-vous fait aujourd'hui ?
        </label>
        <div className="relative">
          <textarea
            ref={contentRef}
            id="content"
            name="content"
            rows="6"
            value={formData.content}
            onChange={handleChange}
            placeholder="Ex: J'ai travaillé sur @project:SiteWeb avec @user:Marie, puis j'ai préparé la réunion @project:ClientX"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            disabled={loading}
          />
          <TagAutocomplete 
            inputRef={contentRef} 
            projectContext={projectContext}
          />
        </div>
        <p className="mt-1 text-xs text-gray-500">
          Utilisez @project:nom et @user:nom pour taguer
        </p>
      </div>

      {/* Difficultés */}
      <div className="space-y-2">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="has_difficulties"
            checked={hasDifficulties}
            onChange={handleDifficultyChange}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="has_difficulties" className="ml-2 block text-sm text-gray-700">
            J'ai rencontré une ou des difficultés
          </label>
        </div>

        {hasDifficulties && (
          <div>
            <textarea
              id="difficulties"
              name="difficulties"
              rows="3"
              value={formData.difficulties}
              onChange={handleChange}
              placeholder="Décrivez les difficultés rencontrées..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              disabled={loading}
            />
          </div>
        )}
      </div>

      {/* Messages d'erreur */}
      {error && <ErrorMessage message={error} />}

      {/* Bouton submit */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? (
            <>
              <LoadingSpinner size="small" />
              <span className="ml-2">Enregistrement...</span>
            </>
          ) : (
            isEditing ? 'Modifier le rapport' : 'Enregistrer le rapport'
          )}
        </button>
      </div>
    </form>
  );
};

export default ReportForm;