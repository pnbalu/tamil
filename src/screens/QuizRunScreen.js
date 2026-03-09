import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { radii } from '../theme/radii';
import { Button } from '../components';

const LIVES = 3;

export default function QuizRunScreen({ navigation, route }) {
  const { questions = [], timePerQuestion = 30, level, direction = 'ta_to_en', roomId, isGroupQuiz, userId } = route.params ?? {};
  const isEnToTa = direction === 'en_to_ta';
  const [index, setIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timePerQuestion);
  const [selectedOption, setSelectedOption] = useState(null);
  const [results, setResults] = useState([]);
  const [lives, setLives] = useState(LIVES);
  const timerRef = useRef(null);
  const timeoutHandledRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  const current = questions[index];
  const total = questions.length;
  const isLast = index >= total - 1;
  const showExplanation = selectedOption !== null;

  useEffect(() => {
    timeoutHandledRef.current = false;
    setSecondsLeft(timePerQuestion);
    setSelectedOption(null);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, timePerQuestion]);

  useEffect(() => {
    if (secondsLeft !== 0 || selectedOption !== null || !current) return;
    if (timeoutHandledRef.current) return;
    timeoutHandledRef.current = true;
    const correct = false;
    const nextResults = [...results, { correct, skipped: true }];
    setResults(nextResults);
    if (timerRef.current) clearInterval(timerRef.current);
    const newLives = Math.max(0, lives - 1);
    setLives(newLives);
    if (newLives <= 0 || isLast) {
      goToResults(nextResults, total);
    } else {
      setIndex((i) => i + 1);
    }
  }, [secondsLeft, selectedOption, current, isLast, total, results, lives]);

  const handleSelect = (optionIndex) => {
    if (selectedOption !== null) return;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const correctIndex = current?.correctIndex ?? 0;
    const correct = optionIndex === correctIndex;
    setSelectedOption(optionIndex);
    const nextResults = [...results, { correct, skipped: false }];
    setResults(nextResults);
    const newLives = correct ? lives : Math.max(0, lives - 1);
    if (!correct) setLives(newLives);
    if (!correct && newLives <= 0) {
      setTimeout(() => goToResults(nextResults, total), 1200);
    }
  };

  const goToResults = (resultList, totalQuestions) => {
    const score = (resultList || results).filter((r) => r.correct).length;
    const payload = {
      results: resultList ?? results,
      total: totalQuestions ?? total,
      level,
      timePerQuestion,
      questions: questions ?? [],
      direction,
    };
    if (isGroupQuiz && roomId && userId != null) {
      const timeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      import('../lib/groupQuizApi').then((api) => {
        api.submitScore(roomId, userId, { score, totalQuestions: totalQuestions ?? total, timeTakenSeconds });
        navigation.replace('GroupQuizResults', { roomId, ...payload });
      });
    } else {
      navigation.replace('QuizResults', payload);
    }
  };

  const handleNext = () => {
    if (isLast) {
      goToResults(results, total);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (!current || total === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noQuestions}>No questions loaded</Text>
        <Button title="Go back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const progressPct = total ? ((index + 1) / total) * 100 : 0;
  const correctOption = current.options?.[current.correctIndex];
  const correctAnswerEn = correctOption?.text_en ?? '';
  const correctAnswerTa = correctOption?.text_ta ?? '';
  const questionWordTa = correctAnswerTa || (() => {
    const match = (current.question_en || '').match(/'([^']+)'/);
    return match ? match[1] : (current.question_ta || current.question_en || '?');
  })();
  const promptWord = isEnToTa ? correctAnswerEn : questionWordTa;
  const promptText = isEnToTa ? 'What is the Tamil word for?' : 'What does this word mean?';
  const instructionText = isEnToTa ? 'Choose the correct Tamil word' : 'Choose the correct meaning';
  const optionDisplayText = (opt) => (isEnToTa ? (opt.text_ta || opt.text_en || '') : (opt.text_en || ''));
  const explanationLine = isEnToTa ? `${correctAnswerEn} = ${correctAnswerTa}` : (correctAnswerTa ? `${correctAnswerTa} = ${correctAnswerEn}` : correctAnswerEn);

  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Smart Quiz</Text>
        <View style={styles.livesRow}>
          {Array.from({ length: LIVES }).map((_, i) => (
            <Text key={i} style={styles.heart}>{i < lives ? '❤️' : '🖤'}</Text>
          ))}
          <Text style={styles.qLabel}>Q {index + 1}/{total}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>Practice Tamil vocabulary</Text>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.prompt}>{promptText}</Text>
          <Text style={[styles.wordTa, isEnToTa && styles.wordEn]} numberOfLines={2}>{promptWord}</Text>
          <Text style={styles.instruction}>{instructionText}</Text>
          {showExplanation ? null : (
            <View style={styles.timerBadge}>
              <Text style={[styles.timerText, secondsLeft <= 10 && styles.timerUrgent]}>{secondsLeft}s</Text>
            </View>
          )}
        </View>

        <View style={styles.options}>
          {(current.options || []).map((opt, i) => {
            const selected = selectedOption === i;
            const correct = i === current.correctIndex;
            const showResult = showExplanation;
            const isCorrect = selected && correct;
            const isWrong = selected && !correct;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  styles.option,
                  showResult && correct && styles.optionCorrect,
                  showResult && isWrong && styles.optionWrong,
                ]}
                onPress={() => handleSelect(i)}
                disabled={showExplanation}
                activeOpacity={0.8}
              >
                <Text style={[styles.optionText, showResult && correct && styles.optionTextCorrect]}>
                  {optionDisplayText(opt) || `Option ${i + 1}`}
                </Text>
                {showResult && correct ? <Text style={styles.check}>✓</Text> : null}
                {showResult && isWrong ? <Text style={styles.cross}>✕</Text> : null}
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && (
          <View style={styles.explanation}>
            <Text style={styles.explanationTitle}>Answer:</Text>
            <Text style={styles.explanationText}>{explanationLine}</Text>
            <Button
              title="Next Question →"
              onPress={handleNext}
              style={styles.nextBtn}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingTop: 56,
    paddingBottom: spacing.xs,
  },
  backBtn: { marginRight: spacing.sm },
  backText: { fontSize: 24, color: colors.textDark, fontWeight: '600' },
  title: { flex: 1, fontSize: typography.h2, fontWeight: typography.bold, color: colors.textDark, textAlign: 'center' },
  livesRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  heart: { fontSize: 16 },
  qLabel: { fontSize: typography.small, color: colors.textMuted, marginLeft: spacing.sm, fontWeight: typography.semibold },
  subtitle: {
    fontSize: typography.small,
    color: colors.textMuted,
    paddingHorizontal: spacing.screen,
    marginBottom: spacing.sm,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: colors.border,
    marginHorizontal: spacing.screen,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  progressBarFill: { height: '100%', backgroundColor: colors.orange, borderRadius: 3 },
  scrollContent: { paddingHorizontal: spacing.screen, paddingBottom: spacing.section * 2 },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  prompt: { fontSize: typography.body, color: colors.textBrown, marginBottom: spacing.sm, textAlign: 'center', width: '100%' },
  wordTa: { fontSize: 32, fontWeight: typography.bold, color: colors.primary, marginBottom: spacing.xs, textAlign: 'center', width: '100%' },
  wordEn: { fontSize: 28 },
  instruction: { fontSize: typography.small, color: colors.textMuted, textAlign: 'center', width: '100%' },
  timerBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  timerText: { fontSize: typography.title, color: colors.textOnPrimary, fontWeight: typography.bold },
  timerUrgent: { color: '#fff' },
  options: { gap: spacing.md },
  option: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  optionText: { fontSize: typography.title, color: colors.textDark, flex: 1 },
  optionCorrect: { borderColor: colors.success, backgroundColor: '#E8F5E9' },
  optionWrong: { borderColor: '#C62828', backgroundColor: '#FFEBEE' },
  optionTextCorrect: { color: colors.success, fontWeight: typography.semibold },
  check: { fontSize: 22, color: colors.success, fontWeight: '700', marginLeft: spacing.sm },
  cross: { fontSize: 20, color: '#C62828', fontWeight: '700', marginLeft: spacing.sm },
  explanation: {
    marginTop: spacing.xxl,
    padding: spacing.xl,
    backgroundColor: '#F5F5F5',
    borderRadius: radii.md,
  },
  explanationTitle: { fontSize: typography.label, fontWeight: typography.bold, color: colors.textBrown, marginBottom: spacing.xs },
  explanationText: { fontSize: typography.body, color: colors.textDark },
  nextBtn: { marginTop: spacing.xl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.screen },
  noQuestions: { fontSize: typography.body, color: colors.textMuted, marginBottom: spacing.lg },
});
