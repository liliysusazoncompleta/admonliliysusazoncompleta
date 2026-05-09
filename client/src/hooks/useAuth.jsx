/**
 * @fileoverview Contexto de Autenticación Global
 * @module client/src/hooks/useAuth
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// ── Instancia de Axios con baseURL del proxy Vite ─────────────────────────────
const api = axios.create({ baseURL: '/api' });

// ── Interceptor: inyectar JWT en cada petición ────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lili_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Contexto ──────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Restaurar sesión desde localStorage al montar
  useEffect(() => {
    const token    = localStorage.getItem('lili_token');
    const userData = localStorage.getItem('lili_usuario');

    if (token && userData) {
      try {
        setUsuario(JSON.parse(userData));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('lili_token');
        localStorage.removeItem('lili_usuario');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Autentica al usuario contra el API.
   * @param {string} correo
   * @param {string} password
   * @returns {{ success: boolean, message?: string }}
   */
  const login = useCallback(async (correo, password) => {
    try {
      const { data } = await api.post('/auth/login', { correo, password });

      if (data.success) {
        localStorage.setItem('lili_token',   data.token);
        localStorage.setItem('lili_usuario', JSON.stringify(data.usuario));
        setUsuario(data.usuario);
        setIsAuthenticated(true);
        return { success: true };
      }

      return { success: false, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Error de conexión con el servidor.';
      return { success: false, message };
    }
  }, []);

  /** Cierra la sesión del usuario actual. */
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignorar errores de red al cerrar sesión */ }
    finally {
      localStorage.removeItem('lili_token');
      localStorage.removeItem('lili_usuario');
      setUsuario(null);
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, loading, isAuthenticated, login, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
};

/** Hook para consumir el contexto de autenticación. */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};

export default AuthContext;
