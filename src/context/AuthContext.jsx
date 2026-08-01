import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // 1. Database Initialization (Auto-reconnect on mount)
  useEffect(() => {
    const autoReconnect = async () => {
      const savedUrl = localStorage.getItem('saved_supabase_db_url');
      if (savedUrl) {
        console.log('[Database Auto-connect] Re-establishing saved database connection...');
        try {
          await axios.post('/api/db-config', { databaseUrl: savedUrl });
          console.log('[Database Auto-connect] Successfully reconnected to Supabase!');
        } catch (err) {
          console.error('[Database Auto-connect] Failed to reconnect to saved database:', err.message);
        }
      }
      setDbInitialized(true);
    };
    autoReconnect();
  }, []);

  // 2. Fetch Profile after Database is Initialized
  useEffect(() => {
    if (!dbInitialized) return;

    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch fresh profile
      axios.get('/api/users/profile')
        .then(res => {
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      delete axios.defaults.headers.common['Authorization'];
      setUser(null);
      setLoading(false);
    }
  }, [token, dbInitialized]);

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: !!user,
      theme,
      toggleTheme
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
