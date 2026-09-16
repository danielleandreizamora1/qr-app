import { Link, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { signIn } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setMessage(null);
    if (!email.trim() || !password) {
      setMessage('Email and password are required.');
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>QR Attendance</Text>
        <Text style={styles.subtitle}>Sign in to record and review attendance.</Text>
        {!isSupabaseConfigured && <Text style={styles.warning}>Configure Supabase in your .env file first.</Text>}
        <TextInput autoCapitalize="none" keyboardType="email-address" placeholder="Email" placeholderTextColor={COLORS.textSecondary} style={styles.input} value={email} onChangeText={setEmail} />
        <TextInput placeholder="Password" placeholderTextColor={COLORS.textSecondary} secureTextEntry style={styles.input} value={password} onChangeText={setPassword} />
        {message && <Text style={styles.message}>{message}</Text>}
        {submitting ? <ActivityIndicator color={COLORS.primary} /> : <AppButton theme="primary" title="Sign In" icon="log-in-outline" onPress={handleSubmit} />}
        <Link href={'/register' as never} style={styles.link}>Create an account</Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center' },
  content: { paddingHorizontal: 24 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  warning: { color: '#C62828', textAlign: 'center', marginBottom: 12 },
  input: { backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.textPrimary, marginBottom: 12 },
  message: { color: '#C62828', textAlign: 'center', marginBottom: 12 },
  link: { color: COLORS.primary, textAlign: 'center', marginTop: 12, fontSize: 15 },
});
