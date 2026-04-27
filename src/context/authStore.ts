import { create } from 'zustand';
import { User } from '@/types';
import { supabase } from '@/services/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  signUp: async (email, password, fullName) => {
    set({ loading: true });
    try {
      // Pass full_name as metadata so the DB trigger can use it
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (authError) throw authError;

      // If email confirmation is disabled, the session is active immediately.
      // The DB trigger (handle_new_user) creates the profile row automatically.
      // Nothing else to do here.
      console.log('Signup successful for:', authData.user?.id);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  getCurrentUser: async () => {
    set({ loading: true });
    try {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        set({ user: null, loading: false });
        return;
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      set({ user: userData || null });
    } catch (error) {
      console.error('Get current user error:', error);
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },
}));
