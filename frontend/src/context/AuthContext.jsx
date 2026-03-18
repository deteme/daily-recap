import { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem('token');
    
    // Si pas de token,
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // On demande TOUJOURS au serveur qui est l'utilisateur actuel
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      localStorage.setItem('user', JSON.stringify(currentUser));
    } catch (err) {
      logout(); 
    } finally {
      setLoading(false);
    }
  };

  initAuth();
}, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const response = await authService.login(email, password);
      
      const { access_token, ...userData } = response;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || 'Erreur de connexion';
      setError(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin';
  const isManager = () => user?.role === 'manager' || user?.role === 'admin';
  const isUser = () => user?.role === 'user';

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAdmin,
    isManager,
    isUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};