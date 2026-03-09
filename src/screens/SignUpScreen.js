import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { radii } from '../theme/radii';
import { AuthScreenLayout, Button, Input, Divider, ErrorText, SuccessModal } from '../components';
import { SECRET_QUESTIONS } from '../constants/secretQuestions';
import { hashSecretAnswer } from '../lib/hashSecret';
import { signInWithGoogle } from '../lib/authGoogle';
import { supabase } from '../lib/supabase';

export default function SignUpScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretQuestionIndex, setSecretQuestionIndex] = useState(0);
  const [secretAnswer, setSecretAnswer] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleCreateAccount = async () => {
    setError('');
    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill name, email and password');
      return;
    }
    if (!secretAnswer.trim()) {
      setError('Please set a secret answer for password recovery');
      return;
    }
    if (!agreeTerms) {
      setError('Please agree to Terms and Privacy Policy');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const hashed = await hashSecretAnswer(secretAnswer);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            secret_question: SECRET_QUESTIONS[secretQuestionIndex],
            secret_answer_hash: hashed,
          },
        },
      });
      if (signUpError) {
        setError(signUpError.message || 'Sign up failed');
        return;
      }
      if (!data?.user) {
        setError('Account may require email confirmation. Check your inbox or try signing in.');
        return;
      }
      setShowSuccessModal(true);
    } catch (err) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = async () => {
    setShowSuccessModal(false);
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSocialLoading(true);
    try {
      const { error: e } = await signInWithGoogle();
      if (e) setError(e.message || 'Google sign in failed');
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <AuthScreenLayout showBackButton onBack={() => navigation.navigate('Login')}>
      <SuccessModal
        visible={showSuccessModal}
        onClose={handleSuccessClose}
        title="Registered successfully"
        message="You can now sign in with your email and password."
      />
      <Text style={styles.welcome}>Join us today!</Text>
      <Text style={styles.subWelcome}>Start your Tamil learning journey</Text>

      <Input label="FULL NAME" placeholder="Arun Kumar" value={fullName} onChangeText={setFullName} />
      <Input
        label="EMAIL ADDRESS"
        placeholder="arun@gmail.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        label="PASSWORD"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Text style={styles.label}>SECRET QUESTION (for password recovery)</Text>
      <View style={styles.pickerWrap}>
        {SECRET_QUESTIONS.map((q, i) => (
          <TouchableOpacity key={i} onPress={() => setSecretQuestionIndex(i)} style={styles.pickerOption}>
            <Text style={styles.pickerOptionText} numberOfLines={1}>{q}</Text>
            <View style={[styles.radio, secretQuestionIndex === i && styles.radioChecked]} />
          </TouchableOpacity>
        ))}
      </View>
      <Input
        placeholder="Your answer"
        value={secretAnswer}
        onChangeText={setSecretAnswer}
        secureTextEntry
      />
      <TouchableOpacity style={styles.termsRow} onPress={() => setAgreeTerms(!agreeTerms)}>
        <View style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}>
          {agreeTerms ? <Text style={styles.checkMark}>✓</Text> : null}
        </View>
        <Text style={styles.termsText}>
          I agree to <Text style={styles.termsLink}>Terms</Text> & <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </TouchableOpacity>
      <ErrorText message={error} />
      <Button
        title={loading ? 'Creating…' : 'Create Account →'}
        onPress={handleCreateAccount}
        disabled={loading}
        loading={loading}
        style={styles.primaryBtn}
      />
      <Divider text="or sign up with" />
      <View style={styles.socialRow}>
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={handleGoogleSignIn}
          disabled={socialLoading}
        >
          <Text style={styles.socialIcon}>🌐</Text>
          <Text style={styles.socialLabel}>{socialLoading ? '…' : 'Google'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.socialBtn}
          onPress={() => navigation.navigate('PhoneAuth')}
        >
          <Text style={styles.socialIcon}>📱</Text>
          <Text style={styles.socialLabel}>Phone</Text>
        </TouchableOpacity>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  welcome: { fontSize: typography.h1, fontWeight: typography.bold, color: colors.textDark },
  subWelcome: { fontSize: typography.small, color: colors.textMuted, marginTop: spacing.xs },
  label: {
    fontSize: typography.label,
    fontWeight: typography.semibold,
    color: colors.textBrown,
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  pickerWrap: { marginTop: spacing.xs },
  pickerOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  pickerOptionText: { flex: 1, fontSize: typography.small, color: colors.textDark },
  radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: colors.border },
  radioChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.lg },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary },
  checkMark: { color: colors.textOnPrimary, fontWeight: typography.bold, fontSize: typography.small },
  termsText: { fontSize: typography.label, color: colors.textMuted, flex: 1 },
  termsLink: { color: colors.primary, fontWeight: typography.semibold },
  primaryBtn: { marginTop: spacing.lg },
  socialRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md, justifyContent: 'center' },
  socialBtn: {
    flex: 1,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  socialIcon: { fontSize: typography.h2 },
  socialLabel: { fontSize: typography.body, color: colors.textDark },
});
