import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme';
import { radii } from '../theme/radii';

export function Card({ children, style, bordered = true, ...rest }) {
  return (
    <View
      style={[
        styles.card,
        bordered && styles.bordered,
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  bordered: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
});
