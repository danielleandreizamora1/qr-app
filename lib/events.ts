import { supabase } from '@/lib/supabase';
import type { Event } from '@/lib/types';

export type CreateEventInput = Pick<Event, 'event_code' | 'title' | 'start' | 'end'> & {
  created_by: string;
};

export async function createEvent(input: CreateEventInput): Promise<Event> {
  const { data, error } = await supabase
    .from('events')
    .insert(input)
    .select('id, event_code, title, start, end, created_by, created_at')
    .single();

  if (error) throw error;
  return data as Event;
}

export async function getEventByCode(eventCode: string): Promise<Event | null> {
  const { data, error } = await supabase
    .from('events')
    .select('id, event_code, title, start, end, created_by, created_at')
    .eq('event_code', eventCode)
    .maybeSingle();

  if (error) throw error;
  return data as Event | null;
}
