export type Role = 'student' | 'teacher' | 'admin';

export type Profile = {
  id: string;
  student_id: string;
  full_name: string;
  course: string | null;
  year_level: string | null;
  role: Role;
  created_at: string;
};

export type Event = {
  id: string;
  event_code: string;
  title: string;
  start: string;
  end: string;
  created_by: string;
  created_at: string;
};

export type AttendanceRecord = {
  id: string;
  event_id: string;
  event_code: string;
  event_title: string;
  scanned_at: string;
};

export type EventPayload = {
  v: 1;
  event: string;
  title?: string;
  start?: string;
  end?: string;
};

export type RegisterResult = {
  success: boolean;
  message: string;
  eventTitle?: string;
};
