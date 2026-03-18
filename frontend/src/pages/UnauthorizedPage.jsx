import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-indigo-600">403</h1>
        <h2 className="text-3xl font-bold text-gray-900 mt-4">
          Accès non autorisé
        </h2>
        <p className="text-gray-600 mt-2">
          Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <Link
          to="/dashboard"
          className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;