import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { radii } from '../theme/radii';
import { AuthScreenLayout, Button, Input, ErrorText } from '../components';
import { sendPhoneOtp, verifyPhoneOtp } from '../lib/authPhone';

export default function PhoneAuthScreen({ navigation }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    setError('');
    const trimmed = phone.trim().replace(/\D/g, '');
    if (trimmed.length < 10) {
      setError('Enter a valid phone number');
      return;
    }
    setLoading(true);
    try {
      const { error: e } = await sendPhoneOtp(trimmed.startsWith('+') ? trimmed : `+${trimmed}`);
      if (e) {
        setError(e.message || 'Failed to send code');
        return;
      }
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    if (otp.trim().length !== 6) {
      setError('Enter the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      const { error: e } = await verifyPhoneOtp(phone.trim(), otp.trim());
      if (e) {
        setError(e.message || 'Invalid code');
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const displayPhone = phone.startsWith('+') ? phone : (phone ? `+${phone}` : '');

  return (
    <AuthScreenLayout showBackButton onBack={() => (step === 'otp' ? setStep('phone') : navigation.navigate('Login'))}>
      {step === 'phone' ? (
        <>
          <Text style={styles.title}>Sign in with Phone</Text>
          <Text style={styles.subtitle}>We’ll send you a 6-digit code by SMS</Text>
          <Input
            label="PHONE NUMBER"
            placeholder="+91 98765 43210"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <ErrorText message={error} />
          <Button
            title={loading ? 'Sending…' : 'Send code'}
            onPress={handleSendOtp}
            disabled={loading}
            loading={loading}
            style={styles.primaryBtn}
          />
        </>
      ) : (
        <>
          <Text style={styles.title}>Enter verification code</Text>
          <Text style={styles.subtitle}>Sent to {displayPhone || phone}</Text>
          <Text style={styles.otpLabel}>6-DIGIT CODE</Text>
          <TextInput
            style={styles.otpInput}
            placeholder="000000"
            placeholderTextColor={colors.textMuted}
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/\D/g, '').slice(0, 6))}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
          />
          <ErrorText message={error} />
          <Button
            title={loading ? 'Verifying…' : 'Verify'}
            onPress={handleVerifyOtp}
            disabled={loading || otp.length !== 6}
            loading={loading}
            style={styles.primaryBtn}
          />
          <TouchableOpacity style={styles.resendWrap} onPress={handleSendOtp} disabled={loading}>
            <Text style={styles.resendText}>Didn’t get the code? Resend</Text>
          </TouchableOpacity>
        </>
      )}
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: typography.h1, fontWeight: typography.bold, color: colors.textDark },
  subtitle: { fontSize: typography.small, color: colors.textMuted, marginTop: spacing.xs },
  otpLabel: {
    fontSize: typography.label,
    fontWeight: typography.semibold,
    color: colors.textBrown,
    letterSpacing: 0.5,
    marginTop: spacing.xxl,
    marginBottom: spacing.xs,
  },
  otpInput: {
    height: 56,
    backgroundColor: colors.cardBg,
    borderRadius: radii.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    fontSize: 24,
    letterSpacing: 8,
    color: colors.textDark,
    textAlign: 'center',
  },
  primaryBtn: { marginTop: spacing.lg },
  resendWrap: { marginTop: spacing.lg, alignSelf: 'center' },
  resendText: { fontSize: typography.small, color: colors.primary, fontWeight: typography.semibold },
});
