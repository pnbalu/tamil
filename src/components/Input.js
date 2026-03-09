import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { radii } from '../theme/radii';

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  style,
  ...rest
}) {
  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <Text style={styles.label}>{label}</Text>
      ) : null}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  label: {
    fontSize: typography.label,
    fontWeight: typography.semibold,
    color: colors.textBrown,
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  input: {
    height: 52,
    backgroundColor: colors.cardBg,
    borderRadius: radii.input,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    fontSize: typography.body,
    color: colors.textDark,
  },
});
