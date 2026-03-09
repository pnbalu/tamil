import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { Button } from '../../components';
import { getCultureQuizQuestions } from '../../lib/cultureApi';

const LIVES = 3;

export default function CultureQuizScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { itemId, itemName, level = 'beginner' } = route.params ?? {};
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [results, setResults] = useState([]);
  const [lives, setLives] = useState(LIVES);

  useEffect(() => {
    if (!itemId) return;
    getCultureQuizQuestions(itemId, 10, level).then(({ questions: q, error: err }) => {
      setQuestions(q || []);
      setError(err || '');
      setLoading(false);
    });
  }, [itemId, level]);

  const current = questions[index];
  const total = questions.length;
  const isLast = index >= total - 1;
  const showExplanation = selectedOption !== null;
  const topMargin = Math.max(insets.top, spacing.lg);

  const handleSelect = (optionIndex) => {
    if (selectedOption !== null) return;
    const correctIndex = current?.correctIndex ?? 0;
    const correct = optionIndex === correctIndex;
    setSelectedOption(optionIndex);
    const nextResults = [...results, { correct, skipped: false }];
    setResults(nextResults);
    const newLives = correct ? lives : Math.max(0, lives - 1);
    setLives(newLives);
    if (!correct && newLives <= 0) {
      setTimeout(() => goToResults(nextResults, total), 1200);
    }
  };

  const goToResults = (resultList, totalQuestions) => {
    const score = (resultList || results).filter((r) => r.correct).length;
    navigation.replace('QuizResults', {
      results: resultList ?? results,
      total: totalQuestions ?? total,
      level,
      questions: questions ?? [],
      isCultureQuiz: true,
      cultureItemName: itemName,
    });
  };

  const handleNext = () => {
    if (isLast) goToResults(results, total);
    else {
      setIndex((i) => i + 1);
      setSelectedOption(null);
    }
  };

  const optionText = (opt) => opt.text_ta || opt.text_en || '';

  if (loading) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !questions.length) {
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity style={[styles.backBtn, { paddingTop: topMargin }]} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.error}>{error || 'No questions available.'}</Text>
        <Button title="Go back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.header, { paddingTop: topMargin }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Culture quiz</Text>
        <View style={styles.livesRow}>
          {[1, 2, 3].map((_, i) => (
            <Text key={i} style={styles.heart}>{i < lives ? '❤️' : '🖤'}</Text>
          ))}
          <Text style={styles.qLabel}>Q {index + 1}/{total}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.questionText}>{current.question_en}</Text>
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
                  {optionText(opt) || `Option ${i + 1}`}
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
            <Text style={styles.explanationText}>{current.explanationLine || ''}</Text>
            <Button title="Next Question →" onPress={handleNext} style={styles.nextBtn} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.screen, paddingBottom: spacing.xs },
  backBtn: { marginRight: spacing.sm },
  backText: { fontSize: 24, color: colors.primary, fontWeight: '600' },
  title: { flex: 1, fontSize: typography.h2, fontWeight: '700', color: colors.textDark, textAlign: 'center' },
  livesRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  heart: { fontSize: 16 },
  qLabel: { fontSize: typography.small, color: colors.textMuted, marginLeft: spacing.sm, fontWeight: '600' },
  scrollContent: { paddingHorizontal: spacing.screen, paddingBottom: spacing.section * 2 },
  card: { backgroundColor: colors.cardBg, borderRadius: radii.lg, padding: spacing.xxl, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.border },
  questionText: { fontSize: typography.body, color: colors.textDark, textAlign: 'center', lineHeight: 24 },
  options: { gap: spacing.md },
  option: { backgroundColor: colors.cardBg, borderRadius: radii.md, padding: spacing.lg, borderWidth: 2, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56 },
  optionText: { fontSize: typography.title, color: colors.textDark, flex: 1 },
  optionCorrect: { borderColor: colors.success, backgroundColor: '#E8F5E9' },
  optionWrong: { borderColor: '#C62828', backgroundColor: '#FFEBEE' },
  optionTextCorrect: { color: colors.success, fontWeight: '600' },
  check: { fontSize: 22, color: colors.success, fontWeight: '700', marginLeft: spacing.sm },
  cross: { fontSize: 20, color: '#C62828', fontWeight: '700', marginLeft: spacing.sm },
  explanation: { marginTop: spacing.xxl, padding: spacing.xl, backgroundColor: '#F5F5F5', borderRadius: radii.md },
  explanationTitle: { fontSize: typography.small, fontWeight: '700', color: colors.textBrown, marginBottom: spacing.xs },
  explanationText: { fontSize: typography.body, color: colors.textDark },
  nextBtn: { marginTop: spacing.xl },
  error: { color: colors.primary, padding: spacing.screen },
});
