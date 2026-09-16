# Supabase Migration

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env` and set the project URL and anon key.
4. Configure email confirmation in Supabase Auth, or disable it for local testing.
5. Register an account in the app.
6. Promote a trusted account to `teacher` in the `profiles` table before testing event creation.

The app uses `expo-secure-store` for the Supabase session and never stores the service-role key on the device.

## Roles

- `student`: scan QR codes, view personal attendance, edit personal profile.
- `teacher`: all student actions plus create events and view attendance for owned events through RLS.
- `admin`: full profile/event/attendance read access through RLS.

New registrations are `student` by default. Role changes must be performed by an administrator in Supabase; the mobile app does not allow self-promotion.

## QR compatibility

The QR payload remains version `1`:

```json
{
  "v": 1,
  "event": "EVT-2026-0001",
  "title": "Founders Day Assembly",
  "start": "2026-09-03T09:00:00",
  "end": "2026-09-03T11:00:00"
}
```

The scanner resolves `event` as `events.event_code`, validates the time window, and writes attendance for the authenticated user.

## Manual verification

- Register a student and confirm a profile row is created.
- Sign in again and confirm the session survives app restart.
- Promote an account to `teacher`; confirm the Teacher tab appears.
- Create an event and scan its QR from a student account.
- Scan the same QR twice; the second scan must report a duplicate.
- Sign in as a different student; confirm the first student's history is not visible.
- Sign in as a student; confirm direct navigation to the Teacher screen is denied.
- Sign out; confirm protected routes redirect to Login.
