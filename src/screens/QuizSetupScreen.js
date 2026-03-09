import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { radii } from '../theme/radii';
import { Button, ErrorText } from '../components';

const QUESTION_COUNTS = [5, 10, 15, 20, 25];
const TIME_OPTIONS = [
  { value: 15, label: '15 sec' },
  { value: 30, label: '30 sec' },
  { value: 60, label: '1 min' },
];

const DIRECTION_OPTIONS = [
  { value: 'ta_to_en', label: 'Tamil → English', hint: 'See Tamil word, choose English meaning' },
  { value: 'en_to_ta', label: 'English → Tamil', hint: 'See English word, choose Tamil word' },
];

export default function QuizSetupScreen({ navigation, route }) {
  const profileLevel = route.params?.level ?? 'beginner';
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [direction, setDirection] = useState('ta_to_en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStart = async () => {
    setError('');
    setLoading(true);
    try {
      const { generateQuizQuestions } = await import('../lib/quizApi');
      const { questions, error: err } = await generateQuizQuestions({
        count: questionCount,
        level: profileLevel,
      });
      if (err || !questions?.length) {
        setError(err || 'Could not load questions. Run the database migration and seed script (see docs).');
        return;
      }
      navigation.replace('QuizRun', {
        questions,
        timePerQuestion,
        level: profileLevel,
        direction,
      });
    } catch (e) {
      setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Smart Quiz</Text>
        <Text style={styles.subtitle}>Set your quiz length and time per question</Text>

        <Text style={styles.label}>Quiz type</Text>
        <View style={styles.chipRow}>
          {DIRECTION_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, styles.chipDirection, direction === opt.value && styles.chipSelected]}
              onPress={() => setDirection(opt.value)}
            >
              <Text style={[styles.chipText, direction === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
              <Text style={[styles.chipHint, direction === opt.value && styles.chipHintSelected]}>{opt.hint}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Number of questions</Text>
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

        <Text style={styles.label}>Time per question</Text>
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
          title={loading ? 'Loading questions…' : 'Start Quiz →'}
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
  backBtn: { position: 'absolute', top: 56, left: spacing.lg, zIndex: 10 },
  backText: { fontSize: 24, color: colors.textDark, fontWeight: '600' },
  scroll: { paddingHorizontal: spacing.screen, paddingTop: 100, paddingBottom: 40 },
  title: { fontSize: typography.h1, fontWeight: typography.bold, color: colors.textDark },
  subtitle: { fontSize: typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.section },
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
  chipDirection: { flex: 1, minWidth: 140, alignItems: 'flex-start' },
  chipText: { fontSize: typography.title, color: colors.textDark, fontWeight: typography.semibold },
  chipTextSelected: { color: colors.textOnPrimary },
  chipHint: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  chipHintSelected: { color: 'rgba(255,255,255,0.9)' },
  primaryBtn: { marginTop: spacing.lg },
  hint: { fontSize: typography.caption, color: colors.textMuted, marginTop: spacing.sm, textAlign: 'center' },
});
