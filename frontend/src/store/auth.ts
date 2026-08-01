import { create } from 'zustand';
import { User } from '../api/types';
import { clearTokens, getAccessToken, setTokens } from '../api/client';
import { authService } from '../api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (accessToken: string, refreshToken: string, user: any) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: (accessToken, refreshToken, user) => {
    setTokens(accessToken, refreshToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nabz_user', JSON.stringify(user));
    }
    set({
      user,
      isAuthenticated: true,
      loading: false,
    });
  },

  logout: () => {
    clearTokens();
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  },

  updateUser: (updatedUser) => {
    const currentUser = get().user;
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedUser };
      if (typeof window !== 'undefined') {
        localStorage.setItem('nabz_user', JSON.stringify(newUser));
      }
      set({ user: newUser });
    }
  },

  initialize: async () => {
    set({ loading: true });
    const token = getAccessToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, loading: false });
      return;
    }

    try {
      // First, read cached user from local storage to speed up initial render
      if (typeof window !== 'undefined') {
        const cachedUserStr = localStorage.getItem('nabz_user');
        if (cachedUserStr) {
          try {
            const cachedUser = JSON.parse(cachedUserStr);
            set({ user: cachedUser, isAuthenticated: true });
          } catch {
            // ignore
          }
        }
      }

      // Fetch fresh profile from backend
      const res = await authService.getProfile();
      if (res.success && res.data) {
        set({
          user: res.data,
          isAuthenticated: true,
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('nabz_user', JSON.stringify(res.data));
        }
      } else {
        get().logout();
      }
    } catch (err) {
      console.error('Failed to initialize auth', err);
      // Don't log out immediately on network errors, but do log out if it's an auth error (401 is handled by client)
    } finally {
      set({ loading: false });
    }
  },
}));
