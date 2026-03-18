import { useNavigate } from 'react-router-dom';
import ReportForm from '../../components/Reports/ReportForm';

const NewReportPage = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Une fois le rapport créé, on redirige vers l'historique
    navigate('/reports', { 
      state: { message: 'Rapport enregistré avec succès !' } 
    });
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Nouveau rapport quotidien</h1>
        <p className="text-slate-600">Partagez vos avancées et vos blocages du jour.</p>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <ReportForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default NewReportPage;