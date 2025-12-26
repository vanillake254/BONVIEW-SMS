import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('bonview.jwt') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const logoutRef = useRef(null);
  const tokenRef = useRef(token);

  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    function decodeJwt(jwt) {
      try {
        const payload = jwt.split('.')[1];
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json);
      } catch {
        return null;
      }
    }

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const payload = decodeJwt(token);
    if (!payload || payload.role !== 'admin') {
      localStorage.removeItem('bonview.jwt');
      setToken(null);
      setUser(null);
      setLoading(false);
      return;
    }

    setUser({ email: payload.email || null, role: payload.role });
    setLoading(false);
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      loading,
      token,
      login: async (email, password) => {
        const resp = await apiFetch('/auth/login', {
          method: 'POST',
          body: { email, password },
        });
        localStorage.setItem('bonview.jwt', resp.token);
        setToken(resp.token);
        setUser({ email: String(email || '').trim().toLowerCase() || null, role: 'admin' });
        return resp.token;
      },
      logout: async () => {
        localStorage.removeItem('bonview.jwt');
        localStorage.removeItem('bonview.lastActivity');
        setToken(null);
        setUser(null);
      },
    }),
    [user, loading, token]
  );

  useEffect(() => {
    logoutRef.current = value.logout;
  }, [value.logout]);

  useEffect(() => {
    const INACTIVITY_MS = 5 * 60 * 1000;
    const STORAGE_KEY = 'bonview.lastActivity';

    if (!token) return undefined;

    let lastSet = 0;

    function setActivity(now = Date.now()) {
      if (!tokenRef.current) return;
      if (now - lastSet < 3000) return;
      lastSet = now;
      localStorage.setItem(STORAGE_KEY, String(now));
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const onActivity = () => setActivity();
    for (const ev of events) window.addEventListener(ev, onActivity, { passive: true });

    function getLast() {
      const raw = localStorage.getItem(STORAGE_KEY);
      const n = Number(raw);
      return Number.isFinite(n) ? n : 0;
    }

    if (!getLast()) setActivity();

    const interval = window.setInterval(async () => {
      if (!tokenRef.current) return;
      const last = getLast();
      if (last && Date.now() - last > INACTIVITY_MS) {
        try {
          await logoutRef.current?.();
        } finally {
          // no-op
        }
      }
    }, 5000);

    const onStorage = (e) => {
      if (e.key !== STORAGE_KEY) return;
      // other tab activity updates are read by interval
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.clearInterval(interval);
      for (const ev of events) window.removeEventListener(ev, onActivity);
      window.removeEventListener('storage', onStorage);
    };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('AuthProvider missing');
  return ctx;
}
