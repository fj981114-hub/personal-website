'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useCallback } from 'react';

// ─── Login ──────────────────────────────────────────────────────
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('邮箱或密码错误');
        return false;
      }

      return true;
    } catch {
      setError('登录失败，请稍后重试');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { login, loading, error, clearError: () => setError(null) };
}

// ─── Logout ─────────────────────────────────────────────────────
export function useLogout() {
  const [loading, setLoading] = useState(false);

  const logout = useCallback(async () => {
    setLoading(true);
    await signOut({ callbackUrl: '/' });
    setLoading(false);
  }, []);

  return { logout, loading };
}

// ─── Get session (hook) ─────────────────────────────────────────
export function useCurrentSession() {
  const { data: session, status } = useSession();
  return {
    session,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  };
}
