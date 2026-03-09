import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { radii } from '../theme/radii';
import { AuthScreenLayout, Button, Input, Divider, ErrorText } from '../components';
import { signInWithGoogle } from '../lib/authGoogle';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const { supabase } = await import('../lib/supabase');
      const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (e) {
        setError(e.message || 'Sign in failed');
        return;
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
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
    <AuthScreenLayout>
      <Text style={styles.welcome}>Welcome back!</Text>
      <Text style={styles.subWelcome}>Sign in to continue learning</Text>

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
      <TouchableOpacity style={styles.forgotWrap} onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotText}>Forgot Password?</Text>
      </TouchableOpacity>
      <ErrorText message={error} />
      <Button
        title={loading ? 'Signing in…' : 'Sign In'}
        onPress={handleSignIn}
        disabled={loading}
        loading={loading}
        style={styles.primaryBtn}
      />
      <Divider text="or continue with" />
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
      <TouchableOpacity style={styles.signUpRow} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.signUpText}>New here? </Text>
        <Text style={styles.signUpLink}>Create Account</Text>
      </TouchableOpacity>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  welcome: { fontSize: typography.hero, fontWeight: typography.bold, color: colors.textDark },
  subWelcome: { fontSize: typography.small, color: colors.textMuted, marginTop: spacing.xs },
  forgotWrap: { alignSelf: 'flex-end', marginTop: spacing.sm },
  forgotText: { fontSize: typography.label, color: colors.primary, fontWeight: typography.semibold },
  primaryBtn: { marginTop: spacing.lg },
  socialRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  socialBtn: {
    flex: 1,
    height: 46,
    borderRadius: radii.input,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  socialIcon: { fontSize: typography.h2 },
  socialLabel: { fontSize: typography.body, color: colors.textDark, fontWeight: typography.medium },
  signUpRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.xxl },
  signUpText: { fontSize: typography.small, color: colors.textMuted },
  signUpLink: { fontSize: typography.small, color: colors.primary, fontWeight: typography.semibold },
});
