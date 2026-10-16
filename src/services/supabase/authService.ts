import { User } from '../../types';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { mapProfileToUser } from './mappers';

export const authService = {
  /**
   * Get currently authenticated user from Supabase session & public.profiles
   */
  getCurrentUser: async (): Promise<User | null> => {
    if (!isSupabaseConfigured) return null;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) {
        return mapProfileToUser(profile);
      }

      // If user row created in auth but not yet in profiles, return fallback from auth metadata
      const meta = user.user_metadata || {};
      return {
        id: user.id,
        fullName: meta.full_name || meta.name || user.email?.split('@')[0] || 'Student',
        email: user.email || '',
        avatarUrl: meta.avatar_url || meta.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        college: 'VIT Bhopal University',
        gender: 'undisclosed',
        role: 'student',
        verificationStatus: 'verified',
        createdAt: user.created_at || new Date().toISOString(),
      };
    } catch (err: any) {
      console.error('[authService.getCurrentUser] Error:', err.message);
      return null;
    }
  },

  /**
   * Fetch all registered student profiles
   */
  getAllUsers: async (): Promise<User[]> => {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[authService.getAllUsers] Error:', error.message);
        return [];
      }

      return (data || []).map(mapProfileToUser);
    } catch (err: any) {
      console.error('[authService.getAllUsers] Exception:', err.message);
      return [];
    }
  },

  /**
   * Email + password login via Supabase Auth
   */
  login: async (email: string, password?: string): Promise<User> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    if (!password) {
      // Magic Link / OTP option or passwordless
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
      });
      if (error) throw new Error(error.message);
      throw new Error('Check your email for the secure magic login link!');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Failed to retrieve user session.');
    }

    // Load profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profile?.is_suspended) {
      await supabase.auth.signOut();
      throw new Error('This account has been suspended by community safety moderators.');
    }

    return profile ? mapProfileToUser(profile) : {
      id: data.user.id,
      fullName: data.user.user_metadata?.full_name || email.split('@')[0],
      email: data.user.email || email,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      college: 'VIT Bhopal University',
      gender: 'undisclosed',
      role: 'student',
      verificationStatus: 'verified',
      createdAt: data.user.created_at,
    };
  },

  /**
   * Sign up with official college email and details
   */
  signup: async (data: {
    fullName: string;
    email: string;
    password?: string;
    college: string;
    gender: 'female' | 'male' | 'undisclosed';
    phone?: string;
    regNumber?: string;
  }): Promise<User> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const generatedPassword = data.password || 'CampusPool@2026';
    const email = data.email.trim().toLowerCase();

    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password: generatedPassword,
      options: {
        data: {
          full_name: data.fullName.trim(),
          college: data.college.trim(),
          gender: data.gender,
          reg_number: data.regNumber?.trim() || null,
        },
      },
    });

    if (authErr) {
      throw new Error(authErr.message);
    }

    if (!authData.user) {
      throw new Error('Account registration failed.');
    }

    // Upsert into public.profiles
    const newProfile = {
      id: authData.user.id,
      full_name: data.fullName.trim(),
      email,
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      college: data.college.trim(),
      reg_number: data.regNumber?.trim() || null,
      gender: data.gender,
      phone: data.phone?.trim() || null,
      verification_status: 'verified',
      role: 'student',
    };

    const { error: profileErr } = await supabase
      .from('profiles')
      .upsert(newProfile);

    if (profileErr) {
      console.warn('[authService.signup] Profile sync notice:', profileErr.message);
    }

    return mapProfileToUser(newProfile);
  },

  /**
   * Sign out of current Supabase session
   */
  logout: async (): Promise<void> => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err: any) {
        console.warn('[authService.logout] Warning:', err.message);
      }
    }
  },

  /**
   * Update student profile in public.profiles table
   */
  updateProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase is not configured.');
    }

    const dbPayload: any = {};
    if (updates.fullName !== undefined) dbPayload.full_name = updates.fullName;
    if (updates.gender !== undefined) dbPayload.gender = updates.gender;
    if (updates.phone !== undefined) dbPayload.phone = updates.phone;
    if (updates.bio !== undefined) dbPayload.bio = updates.bio;
    if (updates.vehicle !== undefined) dbPayload.vehicle = updates.vehicle;
    if (updates.regNumber !== undefined) dbPayload.reg_number = updates.regNumber;
    if (updates.avatarUrl !== undefined) dbPayload.avatar_url = updates.avatarUrl;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbPayload)
      .eq('id', userId)
      .select('*')
      .single();

    if (error) {
      console.error('[authService.updateProfile] Error:', error.message);
      throw new Error(error.message);
    }

    return mapProfileToUser(data);
  },
};
