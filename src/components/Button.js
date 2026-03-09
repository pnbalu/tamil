import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { radii } from '../theme/radii';

const variants = {
  primary: {
    bg: colors.primary,
    text: colors.textOnPrimary,
    border: null,
  },
  secondary: {
    bg: 'transparent',
    text: colors.textOnPrimary,
    border: 'rgba(255,255,255,0.3)',
  },
  outline: {
    bg: colors.cardBg,
    text: colors.textDark,
    border: colors.border,
  },
  gold: {
    bg: colors.gold,
    text: colors.primaryDark,
    border: null,
  },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const v = variants[variant] || variants.primary;
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: v.bg, borderWidth: v.border ? 1.5 : 0, borderColor: v.border || 'transparent' },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <Text style={[styles.text, { color: v.text }, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 52,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  text: {
    fontSize: typography.title,
    fontWeight: typography.bold,
  },
  disabled: { opacity: 0.6 },
});
