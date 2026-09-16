import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, student_id, full_name, course, year_level, role, created_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(
  userId: string,
  changes: Pick<Profile, 'full_name' | 'course' | 'year_level'>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('id', userId)
    .select('id, student_id, full_name, course, year_level, role, created_at')
    .single();

  if (error) throw error;
  return data as Profile;
}
