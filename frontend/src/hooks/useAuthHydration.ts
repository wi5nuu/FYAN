'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store';
import type { User } from '@/types';

export function useAuthHydration() {
  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token) setToken(token);
    if (userStr) {
      try {
        setUser(JSON.parse(userStr) as User);
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, [setUser, setToken]);
}
