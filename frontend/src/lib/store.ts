import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  roles: Array<{ name: string }>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearError: () => void;
  hasRole: (role: string | string[]) => boolean;
  isAdmin: () => boolean;
  isCashier: () => boolean;
  isEditor: () => boolean;
  isManager: () => boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
}

const roleHierarchy: Record<string, string[]> = {
  'super-admin': ['super-admin', 'admin', 'manager', 'cashier', 'editor', 'staff', 'customer'],
  'admin': ['admin', 'manager', 'cashier', 'editor', 'staff', 'customer'],
  'manager': ['manager', 'cashier', 'editor', 'staff', 'customer'],
  'cashier': ['cashier', 'customer'],
  'editor': ['editor', 'customer'],
  'staff': ['staff', 'customer'],
  'customer': ['customer'],
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/v1/auth/login', { email, password });
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/v1/auth/register', data);
      const { user, token } = response.data.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.post('/v1/auth/logout');
    } catch (error) {
      // Ignore error
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isLoading: false });
    }
  },

  setUser: (user: User) => set({ user }),
  setToken: (token: string) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  clearError: () => set({ error: null }),

  hasRole: (role: string | string[]) => {
    const user = get().user;
    if (!user?.roles?.length) return false;
    const roles = Array.isArray(role) ? role : [role];
    const userRoles = user.roles.map(r => r.name);
    return roles.some(r => userRoles.includes(r));
  },

  isAdmin: () => get().hasRole(['super-admin', 'admin']),
  isCashier: () => get().hasRole(['cashier']),
  isEditor: () => get().hasRole(['editor']),
  isManager: () => get().hasRole(['manager', 'super-admin', 'admin']),
}));
