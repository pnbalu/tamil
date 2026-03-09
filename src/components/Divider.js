import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export function Divider({ text = 'or continue with' }) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xxl },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  text: { fontSize: typography.label, color: colors.textMuted, marginHorizontal: spacing.md },
});
