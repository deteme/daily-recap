import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout, isAdmin, isManager } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="font-bold text-xl">
              DailyRecap
            </Link>
            
            <div className="hidden md:flex ml-10 space-x-4">
              <Link to="/dashboard" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Dashboard
              </Link>
              
              {isManager() && (
                <Link to="/projects" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Projets
                </Link>
              )}
              
              <Link to="/reports" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Mes rapports
              </Link>
              
              <Link to="/feed" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                Fil d'actu
              </Link>
              
              {isAdmin() && (
                <Link to="/admin" className="px-3 py-2 rounded-md hover:bg-indigo-700">
                  Administration
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              {user?.display_name} 
              <span className="ml-2 px-2 py-1 bg-indigo-800 rounded-full text-xs">
                {user?.role}
              </span>
            </span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-md bg-indigo-700 hover:bg-indigo-800"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;