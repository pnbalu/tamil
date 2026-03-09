import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

const HEADER_HEIGHT = 200;
const LOGO_CIRCLE_SIZE = 88;

export const AUTH_HEADER_HEIGHT = HEADER_HEIGHT;

export function AuthScreenLayout({ children, showBackButton = false, onBack }) {
  const insets = useSafeAreaInsets();
  const headerTotalHeight = HEADER_HEIGHT + insets.top;

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[colors.orange, colors.primary]}
        style={[styles.topBand, { paddingTop: insets.top, height: headerTotalHeight }]}
      >
        {showBackButton && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>த</Text>
          </View>
          <Text style={styles.logoTitle}>தமிழ் கற்போம்</Text>
        </View>
      </LinearGradient>
      <View style={[styles.topCurve, { top: headerTotalHeight - 24 }]} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.flex, { marginTop: headerTotalHeight }]}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  topBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backBtn: { position: 'absolute', top: 16, left: spacing.screen, zIndex: 1 },
  backText: { fontSize: 22, color: colors.textOnPrimary },
  logoWrap: { alignItems: 'center', marginTop: 8 },
  logoCircle: {
    width: LOGO_CIRCLE_SIZE,
    height: LOGO_CIRCLE_SIZE,
    borderRadius: LOGO_CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: { fontSize: 44, color: colors.gold, fontWeight: '700' },
  logoTitle: { fontSize: 14, color: 'rgba(255,255,255,0.92)', letterSpacing: 2, marginTop: 10 },
  topCurve: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 24,
    backgroundColor: colors.screenBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: spacing.screen, paddingTop: 28, paddingBottom: spacing.section + 24 },
});
