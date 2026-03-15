import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { Button, ErrorText } from '../../components';

const QUESTION_COUNTS = [5, 10, 15, 20, 25];
const TIME_OPTIONS = [
  { value: 15, label: '15 sec' },
  { value: 30, label: '30 sec' },
  { value: 60, label: '1 min' },
];
const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Easy', hint: '1 word to fill' },
  { value: 'medium', label: 'Medium', hint: '2 words to fill' },
  { value: 'hard', label: 'Hard', hint: '3 words to fill' },
];

export default function AathichudiQuizSetupScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = () => {
    setError('');
    setLoading(true);
    navigation.replace('AathichudiPlay', {
      questionCount,
      timePerQuestion,
      difficulty,
    });
    setLoading(false);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.backBtn, { top: topMargin + 8 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>வினாடி வினா · Quiz</Text>
        <Text style={styles.subtitle}>Set number of verses, time per verse, and difficulty</Text>

        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.chipRow}>
          {DIFFICULTY_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, styles.chipDirection, difficulty === opt.value && styles.chipSelected]}
              onPress={() => setDifficulty(opt.value)}
            >
              <Text style={[styles.chipText, difficulty === opt.value && styles.chipTextSelected]}>
                {opt.label}
              </Text>
              <Text style={[styles.chipHint, difficulty === opt.value && styles.chipHintSelected]}>
                {opt.hint}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Number of verses</Text>
        <View style={styles.chipRow}>
          {QUESTION_COUNTS.map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.chip, questionCount === n && styles.chipSelected]}
              onPress={() => setQuestionCount(n)}
            >
              <Text style={[styles.chipText, questionCount === n && styles.chipTextSelected]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Time per verse</Text>
        <View style={styles.chipRow}>
          {TIME_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, timePerQuestion === opt.value && styles.chipSelected]}
              onPress={() => setTimePerQuestion(opt.value)}
            >
              <Text style={[styles.chipText, timePerQuestion === opt.value && styles.chipTextSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ErrorText message={error} />
        <Button
          title={loading ? 'Starting…' : 'Start Quiz →'}
          onPress={handleStart}
          disabled={loading}
          loading={loading}
          style={styles.primaryBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  backBtn: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: { fontSize: 18, color: colors.primary, fontWeight: '600' },
  scroll: { paddingHorizontal: spacing.screen, paddingTop: 80, paddingBottom: 40 },
  title: { fontSize: typography.h1, fontWeight: typography.bold, color: colors.textDark },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.section,
  },
  label: {
    fontSize: typography.label,
    fontWeight: typography.semibold,
    color: colors.textBrown,
    marginBottom: spacing.sm,
    letterSpacing: 0.5,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
  chip: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.pill,
    backgroundColor: colors.cardBg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipDirection: { flex: 1, minWidth: 100, alignItems: 'flex-start' },
  chipText: { fontSize: typography.title, color: colors.textDark, fontWeight: typography.semibold },
  chipTextSelected: { color: colors.textOnPrimary },
  chipHint: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  chipHintSelected: { color: 'rgba(255,255,255,0.9)' },
  primaryBtn: { marginTop: spacing.lg },
});
