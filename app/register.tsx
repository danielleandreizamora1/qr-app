import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput } from 'react-native';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { signUp } from '@/lib/auth';

export default function RegisterScreen() {
  const [form, setForm] = useState({ email: '', password: '', studentId: '', fullName: '', course: '', yearLevel: '' });
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const update = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async () => {
    setMessage(null);
    if (!form.email.trim() || !form.password || !form.studentId.trim() || !form.fullName.trim()) {
      setMessage('Email, password, student ID, and full name are required.');
      return;
    }
    if (form.password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await signUp(form);
      if (result.session) router.replace('/(tabs)');
      else setMessage('Account created. Check your email to confirm it, then sign in.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Your account identifies attendance records across devices.</Text>
        {([['fullName', 'Full name'], ['studentId', 'Student ID'], ['course', 'Course'], ['yearLevel', 'Year level'], ['email', 'Email']] as const).map(([field, placeholder]) => (
          <TextInput key={field} autoCapitalize={field === 'email' ? 'none' : 'words'} keyboardType={field === 'email' ? 'email-address' : 'default'} placeholder={placeholder} placeholderTextColor={COLORS.textSecondary} style={styles.input} value={form[field]} onChangeText={(value) => update(field, value)} />
        ))}
        <TextInput placeholder="Password" placeholderTextColor={COLORS.textSecondary} secureTextEntry style={styles.input} value={form.password} onChangeText={(value) => update('password', value)} />
        {message && <Text style={styles.message}>{message}</Text>}
        {submitting ? <ActivityIndicator color={COLORS.primary} /> : <AppButton theme="primary" title="Register" icon="person-add-outline" onPress={handleSubmit} />}
        <Link href={'/login' as never} style={styles.link}>Back to sign in</Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.textPrimary, marginBottom: 12 },
  message: { color: COLORS.primary, textAlign: 'center', marginBottom: 12 },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: 12, fontSize: 15 },
});
