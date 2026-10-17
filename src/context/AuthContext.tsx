import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('app_session_token');
      if (!savedToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/verify', {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          // If server rejects token, check if client fallback is active
          const clientPass = import.meta.env.VITE_APP_PASSWORD;
          if (clientPass && savedToken === `client_${clientPass}`) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('app_session_token');
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        // Fallback for static builds without server endpoint
        const clientPass = import.meta.env.VITE_APP_PASSWORD;
        if (savedToken && (savedToken.startsWith('client_') || savedToken.length > 10)) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    const trimmed = password.trim();
    if (!trimmed) {
      return { success: false, error: 'Lütfen parolayı giriniz.' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.token) {
        localStorage.setItem('app_session_token', data.token);
        setIsAuthenticated(true);
        return { success: true };
      }

      // If server returned 401 unauthorized
      if (res.status === 401) {
        return { 
          success: false, 
          error: data.message || 'Hatalı parola! Lütfen tekrar kontrol edin.' 
        };
      }
    } catch (err) {
      // Fallback if backend API is not available (e.g. pure static deployment)
      const clientPass = import.meta.env.VITE_APP_PASSWORD;
      if (clientPass && trimmed === clientPass.trim()) {
        localStorage.setItem('app_session_token', `client_${clientPass}`);
        setIsAuthenticated(true);
        return { success: true };
      }
    }

    return { 
      success: false, 
      error: 'Hatalı parola! Lütfen tekrar kontrol edin.' 
    };
  };

  const logout = () => {
    localStorage.removeItem('app_session_token');
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
