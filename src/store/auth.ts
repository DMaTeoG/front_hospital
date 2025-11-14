'use client';

import { create } from 'zustand';

import { api, registerRefreshHandler, setAccessToken } from '@/lib/api';
import type { Role, User } from '@/types/users';

const STORAGE_KEY = 'hospital-auth-tokens';

type StoredTokens = {
  access: string | null;
  refresh: string | null;
};

const readStoredTokens = (): StoredTokens => {
  if (typeof window === 'undefined') return { access: null, refresh: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { access: null, refresh: null };
    const parsed = JSON.parse(raw) as StoredTokens;
    return {
      access: parsed.access ?? null,
      refresh: parsed.refresh ?? null,
    };
  } catch {
    return { access: null, refresh: null };
  }
};

const writeStoredTokens = (tokens: StoredTokens) => {
  if (typeof window === 'undefined') return;
  if (!tokens.access && !tokens.refresh) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
};

type AuthState = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<void>;
  refresh: () => Promise<string | null>;
};

type LoginResponse = {
  access: string;
  refresh?: string;
};

type ApiUser = {
  id: number;
  email: string;
  role: Role;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
};

const mapUser = (payload: ApiUser): User => {
  const fullName = [payload.first_name, payload.last_name].filter(Boolean).join(' ').trim();
  return {
    id: payload.id,
    email: payload.email,
    role: payload.role,
    name: fullName || payload.email,
    active: payload.is_active,
  };
};

const storedTokens = readStoredTokens();
if (storedTokens.access) {
  setAccessToken(storedTokens.access);
}

export const useAuth = create<AuthState>((set, get) => {
  const clearSession = () => {
    setAccessToken(null);
    writeStoredTokens({ access: null, refresh: null });
    set({ token: null, refreshToken: null, user: null });
  };

  return {
    user: null,
    token: storedTokens.access,
    refreshToken: storedTokens.refresh ?? null,
    loading: false,
    initialized: false,
    login: async (email, password) => {
      set({ loading: true });
      try {
        const { data } = await api.post<LoginResponse>('/auth/login', {
          email,
          password,
        });
        setAccessToken(data.access);
        writeStoredTokens({ access: data.access, refresh: data.refresh ?? null });
        set({ token: data.access, refreshToken: data.refresh ?? null });
        await get().me();
        if (!get().user) {
          throw new Error('No se pudo cargar el perfil del usuario.');
        }
      } catch (error) {
        clearSession();
        throw error instanceof Error
          ? error
          : new Error('No se pudo iniciar sesión.');
      } finally {
        set({ loading: false });
      }
    },
    logout: async () => {
      try {
        await api.post('/auth/logout');
      } catch {
        // ignore backend logout errors
      }
      clearSession();
      set({ initialized: true });
    },
    me: async () => {
      try {
        const { data } = await api.get<ApiUser>('/auth/me');
        set({ user: mapUser(data), initialized: true });
      } catch {
        set({ user: null, initialized: true });
      }
    },
    refresh: async () => {
      const refreshToken = get().refreshToken;
      if (!refreshToken) {
        clearSession();
        return null;
      }
      try {
        const { data } = await api.post<LoginResponse>('/auth/refresh', {
          refresh: refreshToken,
        });
        if (data?.access) {
          setAccessToken(data.access);
          writeStoredTokens({
            access: data.access,
            refresh: data.refresh ?? refreshToken,
          });
          set({
            token: data.access,
            refreshToken: data.refresh ?? refreshToken,
          });
          return data.access;
        }
      } catch {
        // fall through to reset state below
      }
      clearSession();
      return null;
    },
  };
});

registerRefreshHandler(async () => {
  const token = await useAuth.getState().refresh();
  return token;
});
