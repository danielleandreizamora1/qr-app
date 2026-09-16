import { getCurrentUser } from '@/lib/auth';
import { getEventByCode } from '@/lib/events';
import { supabase } from '@/lib/supabase';
import type { AttendanceRecord, EventPayload, RegisterResult } from '@/lib/types';

function parsePayload(rawPayload: string): EventPayload | null {
  try {
    const payload = JSON.parse(rawPayload) as Partial<EventPayload>;
    if (payload.v !== 1 || typeof payload.event !== 'string' || !payload.event.trim()) {
      return null;
    }
    return payload as EventPayload;
  } catch {
    return null;
  }
}

export async function registerAttendance(rawPayload: string): Promise<RegisterResult> {
  const payload = parsePayload(rawPayload);
  if (!payload) return { success: false, message: 'Not an attendance QR code.' };

  const user = await getCurrentUser();
  if (!user) return { success: false, message: 'Please sign in before scanning.' };

  const event = await getEventByCode(payload.event);
  if (!event) return { success: false, message: 'Event was not found.' };

  const start = new Date(event.start).getTime();
  const end = new Date(event.end).getTime();
  const now = Date.now();
  if (Number.isNaN(start) || Number.isNaN(end)) {
    return { success: false, message: 'Event has an invalid time window.' };
  }
  if (now < start) return { success: false, message: 'Event has not started yet.' };
  if (now > end) return { success: false, message: 'Event has already ended.' };

  const { error } = await supabase.from('attendance').insert({
    student_id: user.id,
    event_id: event.id,
  });

  if (error?.code === '23505') {
    return {
      success: false,
      message: 'Already registered for this event.',
      eventTitle: event.title,
    };
  }
  if (error) throw error;

  return { success: true, message: 'Attendance recorded!', eventTitle: event.title };
}

export async function getAttendanceHistory(): Promise<AttendanceRecord[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('attendance')
    .select('id, event_id, scanned_at, events!inner(event_code, title)')
    .eq('student_id', user.id)
    .order('scanned_at', { ascending: false });

  if (error) throw error;

  return ((data ?? []) as unknown as Array<{
    id: string;
    event_id: string;
    scanned_at: string;
    events: { event_code: string; title: string };
  }>).map((row) => ({
    id: row.id,
    event_id: row.event_id,
    event_code: row.events.event_code,
    event_title: row.events.title,
    scanned_at: row.scanned_at,
  }));
}
