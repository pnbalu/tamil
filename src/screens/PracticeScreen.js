import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../theme';
import { radii } from '../theme/radii';

export default function PracticeScreen({ navigation, profile }) {
  const insets = useSafeAreaInsets();
  const level = profile?.level || 'beginner';
  const topPadding = Math.max(insets.top, spacing.lg);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Practice</Text>
        <Text style={styles.subtitle}>Test your Tamil with quizzes</Text>

        <TouchableOpacity
          style={styles.quizCard}
          onPress={() => navigation.getParent()?.navigate('QuizSetup', { level })}
          activeOpacity={0.85}
        >
          <View style={styles.cardIconWrap}>
            <Ionicons name="bulb-outline" size={36} color={colors.primary} />
          </View>
          <Text style={styles.quizTitle}>Smart Quiz</Text>
          <Text style={styles.quizDesc}>Set question count & time limit. Questions from the database.</Text>
          <Text style={styles.quizCta}>Start Quiz →</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quizCard, styles.quizCardSecondary]}
          onPress={() => navigation.getParent()?.navigate('GroupQuizHome', { userId: profile?.id, level })}
          activeOpacity={0.85}
        >
          <View style={styles.cardIconWrap}>
            <Ionicons name="people-outline" size={36} color={colors.primary} />
          </View>
          <Text style={styles.quizTitle}>Group Quiz</Text>
          <Text style={styles.quizDesc}>Create a room, get a unique number. Friends join with the number. Start when everyone is in.</Text>
          <Text style={styles.quizCta}>Create or Join →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingBottom: spacing.xxl },
  title: { fontSize: 26, fontWeight: '700', color: colors.textDark },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  quizCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quizCardSecondary: { borderColor: colors.primary, backgroundColor: '#fff9f8' },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff9f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quizTitle: { fontSize: typography.h2, fontWeight: '600', color: colors.textDark },
  quizDesc: { fontSize: typography.small, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 20 },
  quizCta: { fontSize: typography.title, color: colors.primary, fontWeight: '600', marginTop: spacing.md },
});
