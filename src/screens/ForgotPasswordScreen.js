import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { colors } from '../theme';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [secretQuestion, setSecretQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchSecretQuestion = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { data, error: rpcError } = await supabase.rpc('get_secret_question_for_reset', { user_email: email.trim() });
      if (rpcError) {
        setError(rpcError.message || 'Could not find account');
        return;
      }
      const q = data?.secret_question;
      if (!q) {
        setError('No account found with this email');
        return;
      }
      setSecretQuestion(q);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError('');
    if (!answer.trim()) {
      setError('Please enter your secret answer');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/verify-reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), answer: answer.trim(), new_password: newPassword }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Reset failed');
        return;
      }
      navigation.navigate('ForgotPasswordSuccess');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.backBtn} onPress={step === 1 ? () => navigation.navigate('Login') : () => setStep(1)}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🔑</Text>
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          {step === 1 ? (
            <>
              <Text style={styles.subtitle}>Enter your email and we'll show your secret question to reset your password.</Text>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="arun@gmail.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              {error ? <Text style={styles.errText}>{error}</Text> : null}
              <TouchableOpacity style={styles.primaryBtn} onPress={fetchSecretQuestion} disabled={loading}>
                <Text style={styles.primaryBtnText}>{loading ? 'Checking…' : 'Continue →'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>Answer your secret question to set a new password.</Text>
              <View style={styles.questionCard}>
                <Text style={styles.questionLabel}>Your secret question</Text>
                <Text style={styles.questionText}>{secretQuestion}</Text>
              </View>
              <Text style={styles.label}>YOUR ANSWER</Text>
              <TextInput
                style={styles.input}
                placeholder="Your answer"
                placeholderTextColor={colors.textMuted}
                value={answer}
                onChangeText={setAnswer}
                secureTextEntry
              />
              <Text style={[styles.label, { marginTop: 12 }]}>NEW PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <Text style={[styles.label, { marginTop: 12 }]}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat new password"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              {error ? <Text style={styles.errText}>{error}</Text> : null}
              <TouchableOpacity style={styles.primaryBtn} onPress={handleResetPassword} disabled={loading}>
                <Text style={styles.primaryBtnText}>{loading ? 'Resetting…' : 'Reset Password →'}</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.backToSignIn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backToSignInText}>Remember it? <Text style={styles.backToSignInLink}>Back to Sign In</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 80, paddingBottom: 40 },
  backBtn: { position: 'absolute', top: 56, left: 24, zIndex: 1 },
  backText: { fontSize: 20, color: colors.textBrown },
  iconWrap: { alignItems: 'center', marginBottom: 16 },
  icon: { fontSize: 64 },
  title: { fontSize: 24, fontWeight: '700', color: colors.textDark, textAlign: 'center' },
  subtitle: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 8, paddingHorizontal: 16 },
  label: { fontSize: 11, fontWeight: '600', color: colors.textBrown, letterSpacing: 0.5, marginTop: 24 },
  input: { height: 54, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: colors.border, marginTop: 6, paddingHorizontal: 16, fontSize: 13, color: colors.textDark },
  questionCard: { backgroundColor: 'rgba(192,57,43,0.08)', borderRadius: 14, padding: 16, marginTop: 20, borderWidth: 1, borderColor: colors.primary },
  questionLabel: { fontSize: 10, color: colors.textMuted, marginBottom: 4 },
  questionText: { fontSize: 14, color: colors.textDark, fontWeight: '600' },
  errText: { marginTop: 8, fontSize: 12, color: colors.primary },
  primaryBtn: { marginTop: 24, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },
  backToSignIn: { marginTop: 24, alignItems: 'center' },
  backToSignInText: { fontSize: 12, color: colors.textMuted },
  backToSignInLink: { color: colors.primary, fontWeight: '600' },
});
