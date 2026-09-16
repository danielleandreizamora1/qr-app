import { COLORS } from '@/constants/colors';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';

import AppButton from '@/components/AppButton';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/lib/profiles';

export default function ProfileScreen() {
  const { profile, signOut, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [course, setCourse] = useState(profile?.course ?? '');
  const [yearLevel, setYearLevel] = useState(profile?.year_level ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!profile) {
    return <ActivityIndicator style={styles.loader} color={COLORS.primary} />;
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await updateProfile(profile.id, {
        full_name: fullName.trim(),
        course: course.trim() || null,
        year_level: yearLevel.trim() || null,
      });
      await refreshProfile();
      setMessage('Profile updated.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>
      <Text style={styles.meta}>Student ID: {profile.student_id}</Text>
      <Text style={styles.meta}>Role: {profile.role}</Text>
      <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full name" placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={styles.input} value={course} onChangeText={setCourse} placeholder="Course" placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={styles.input} value={yearLevel} onChangeText={setYearLevel} placeholder="Year level" placeholderTextColor={COLORS.textSecondary} />
      {message && <Text style={styles.message}>{message}</Text>}
      {saving ? <ActivityIndicator color={COLORS.primary} /> : <AppButton theme="primary" title="Save Profile" icon="save-outline" onPress={handleSave} />}
      <AppButton title="Sign Out" icon="log-out-outline" onPress={signOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 24, paddingTop: 32 },
  loader: { flex: 1, backgroundColor: COLORS.background },
  title: { fontSize: 20, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  meta: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 6 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.textPrimary, marginTop: 14 },
  message: { color: COLORS.primary, textAlign: 'center', marginVertical: 12 },
});