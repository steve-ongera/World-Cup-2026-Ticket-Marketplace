import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { authApi } from "../utils/api.js";
import {
  setTokens,
  clearTokens,
  getCachedUser,
  setCachedUser,
  clearCachedUser,
  getRefreshToken,
  isRefreshTokenValid,
} from "../utils/auth.js";

/* ─── Context ─── */

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/* ─── Provider ─── */

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(getCachedUser);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  /* Fetch fresh profile from server */
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await authApi.getProfile();
      setUser(data);
      setCachedUser(data);
      setError(null);
    } catch (err) {
      // If 401 and no valid refresh token, clear everything
      if (err.response?.status === 401 && !isRefreshTokenValid()) {
        clearTokens();
        clearCachedUser();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /* On mount — if we have a cached user or tokens, verify session */
  useEffect(() => {
    const cached = getCachedUser();
    if (cached && isRefreshTokenValid()) {
      // Optimistic render with cache, then validate in background
      setUser(cached);
      setLoading(false);
      fetchProfile();
    } else if (isRefreshTokenValid()) {
      fetchProfile();
    } else {
      clearTokens();
      clearCachedUser();
      setUser(null);
      setLoading(false);
    }
  }, [fetchProfile]);

  /* ─── Login ─── */
  const login = useCallback(async (email, password) => {
    setError(null);
    const { data } = await authApi.login(email, password);
    setTokens({ access: data.access, refresh: data.refresh });
    await fetchProfile();
    return data;
  }, [fetchProfile]);

  /* ─── Register ─── */
  const register = useCallback(async (formData) => {
    setError(null);
    const { data } = await authApi.register(formData);
    // Auto-login after registration
    await login(formData.email, formData.password);
    return data;
  }, [login]);

  /* ─── Logout ─── */
  const logout = useCallback(async () => {
    try {
      const refresh = getRefreshToken();
      if (refresh) await authApi.logout(refresh);
    } catch {
      // Ignore server errors on logout
    } finally {
      clearTokens();
      clearCachedUser();
      setUser(null);
    }
  }, []);

  /* ─── Update profile ─── */
  const updateProfile = useCallback(async (data) => {
    const { data: updated } = await authApi.updateProfile(data);
    setUser(updated);
    setCachedUser(updated);
    return updated;
  }, []);

  /* ─── Update avatar ─── */
  const updateAvatar = useCallback(async (formData) => {
    const { data: updated } = await authApi.updateAvatar(formData);
    setUser(updated);
    setCachedUser(updated);
    return updated;
  }, []);

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    isSeller: user?.is_verified_seller ?? false,
    login,
    register,
    logout,
    updateProfile,
    updateAvatar,
    refreshProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}