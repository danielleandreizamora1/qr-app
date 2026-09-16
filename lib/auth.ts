import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

export type SignUpInput = {
  email: string;
  password: string;
  studentId: string;
  fullName: string;
  course?: string;
  yearLevel?: string;
};

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUp(input: SignUpInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        student_id: input.studentId.trim(),
        full_name: input.fullName.trim(),
        course: input.course?.trim() || null,
        year_level: input.yearLevel?.trim() || null,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
