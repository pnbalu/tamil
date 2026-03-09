import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export function LogoHeader({ title = 'தமிழ் கற்போம்', subtitle, size = 'default' }) {
  const isSmall = size === 'small';
  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, isSmall && styles.circleSmall]}>
        <Text style={[styles.letter, isSmall && styles.letterSmall]}>த</Text>
      </View>
      <Text style={[styles.title, isSmall && styles.titleSmall]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginBottom: spacing.xxl },
  circle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleSmall: { width: 72, height: 72, borderRadius: 36 },
  letter: { fontSize: 42, color: colors.gold },
  letterSmall: { fontSize: 32 },
  title: { fontSize: typography.sub, color: colors.textOnPrimary, letterSpacing: 2, marginTop: spacing.sm },
  titleSmall: { fontSize: typography.label },
  subtitle: { fontSize: typography.small, color: colors.gold, marginTop: spacing.xs },
});
