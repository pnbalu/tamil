import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  spacing,
  typography,
  shadows,
  screenGradientColors,
} from '../../theme';
import { radii } from '../../theme/radii';
import {
  getRandomVersesForPlay,
  buildBlanksForLine,
  getWordPoolForOptions,
} from '../../lib/aathichudiApi';

const WORDS_TO_HIDE = { easy: 1, medium: 2, hard: 3 };

export default function AathichudiPlayScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const questionCount = route.params?.questionCount ?? 10;
  const timePerQuestion = route.params?.timePerQuestion ?? 30;
  const difficulty = route.params?.difficulty || 'easy';
  const wordsToHide = WORDS_TO_HIDE[difficulty] ?? 1;

  const [verses, setVerses] = useState([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optionsPerBlank, setOptionsPerBlank] = useState([]);
  const [selectedBlanks, setSelectedBlanks] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const verse = verses[index];
  const { displayParts, blanks } = verse
    ? buildBlanksForLine(verse.line_ta, wordsToHide, verse.id)
    : { displayParts: [], blanks: [] };

  const loadGame = useCallback(async () => {
    setLoading(true);
    const count = Math.min(Math.max(1, questionCount), 109);
    const { verses: v, error: e } = await getRandomVersesForPlay(count);
    setVerses(v || []);
    setError(e || null);
    setIndex(0);
    setResults([]);
    setSelectedBlanks({});
    setRevealed(false);
    setScore(0);
    setStreak(0);
    setLoading(false);
  }, [questionCount]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  useEffect(() => {
    setSelectedBlanks({});
    setRevealed(false);
    setOptionsPerBlank([]);
  }, [difficulty]);

  useEffect(() => {
    if (!verse || blanks.length === 0) {
      setOptionsPerBlank([]);
      return;
    }
    const correctWords = blanks.map((b) => b.correctWord);
    getWordPoolForOptions(60, correctWords).then((pool) => {
      const opts = blanks.map((blank) => {
        const wrong = pool.filter((w) => w !== blank.correctWord).slice(0, 3);
        const all = [blank.correctWord, ...wrong].sort(() => Math.random() - 0.5);
        return all;
      });
      setOptionsPerBlank(opts);
    });
  }, [verse?.id, blanks.length]);

  const handleBack = () => navigation.goBack();
  const handleSelectOption = (blankIndex, word) => {
    if (revealed) return;
    setSelectedBlanks((prev) => ({ ...prev, [blankIndex]: word }));
  };
  const allFilled = blanks.length > 0 && blanks.every((_, i) => selectedBlanks[i] != null);
  const correctCount = blanks.length > 0 ? blanks.filter((_, i) => selectedBlanks[i] === blanks[i].correctWord).length : 0;

  const handleCheck = () => {
    if (!allFilled) return;
    setRevealed(true);
    const right = blanks.filter((_, i) => selectedBlanks[i] === blanks[i].correctWord).length;
    const verseCorrect = right === blanks.length;
    setScore((s) => s + right * 2);
    if (verseCorrect) setStreak((st) => st + 1);
    else setStreak(0);
  };

  const handleNext = () => {
    const currentVerseCorrect = blanks.length > 0 && blanks.every((_, i) => selectedBlanks[i] === blanks[i].correctWord);
    const nextResults = [...results, { correct: currentVerseCorrect }];
    if (index + 1 < verses.length) {
      setResults(nextResults);
      setIndex((i) => i + 1);
      setSelectedBlanks({});
      setRevealed(false);
      setOptionsPerBlank([]);
    } else {
      navigation.replace('AathichudiQuizResults', {
        results: nextResults,
        total: verses.length,
        timePerQuestion,
        difficulty,
        verses,
      });
    }
  };

  const setDifficulty = (d) => {
    navigation.setParams({ difficulty: d });
  };

  if (loading && verses.length === 0) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && verses.length === 0) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <Text style={styles.error}>{error}</Text>
        <Pressable onPress={handleBack} style={styles.backBtnStandalone}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  if (!verse) return null;

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={screenGradientColors} style={styles.screenGradient} />
      <View style={[styles.headerBar, { paddingTop: topMargin }]}>
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>QUIZ — Complete the verse</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>{score} pts</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.difficultyRow}>
          {(['easy', 'medium', 'hard']).map((d) => (
            <Pressable
              key={d}
              style={[styles.diffChip, difficulty === d && styles.diffChipActive]}
              onPress={() => setDifficulty(d)}
            >
              <Text style={[styles.diffChipText, difficulty === d && styles.diffChipTextActive]}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{score}</Text>
            <Text style={styles.statLabel}>Score</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="flame" size={18} color={colors.orange} />
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{index + 1}/{verses.length}</Text>
            <Text style={styles.statLabel}>Progress</Text>
          </View>
        </View>

        <Text style={styles.verseLabel}>வரி #{verse.id}</Text>
        <View style={styles.verseBlock}>
          <View style={styles.verseCard}>
            <View style={styles.lineWithBlanks}>
              {displayParts.map((part, i) =>
                part.type === 'text' ? (
                  <Text key={i} style={styles.blankLineText}>{part.value}</Text>
                ) : (
                  <View key={i} style={styles.blankSlot}>
                    {selectedBlanks[part.blankIndex] != null ? (
                      <Text style={[styles.blankFilled, revealed && selectedBlanks[part.blankIndex] !== blanks[part.blankIndex].correctWord && styles.blankWrong]}>
                        {selectedBlanks[part.blankIndex]}
                      </Text>
                    ) : (
                      <View style={styles.blankDashed} />
                    )}
                  </View>
                )
              )}
            </View>
          </View>
        </View>

        {verse.meaning_en ? (
          <View style={styles.hintBox}>
            <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
            <Text style={styles.hintText}>{verse.meaning_en}</Text>
          </View>
        ) : null}

        {blanks.map((blank, blankIndex) => (
          <View key={blankIndex} style={styles.optionsBlock}>
            <Text style={styles.optionLabel}>Blank {blankIndex + 1}</Text>
            <View style={styles.optionsRow}>
              {(optionsPerBlank[blankIndex] || []).map((word) => {
                const selected = selectedBlanks[blankIndex] === word;
                const isCorrect = word === blank.correctWord;
                const showCorrect = revealed && isCorrect;
                const showWrong = revealed && selected && !isCorrect;
                return (
                  <TouchableOpacity
                    key={word}
                    style={[
                      styles.optionChip,
                      selected && styles.optionChipSelected,
                      showCorrect && styles.optionChipCorrect,
                      showWrong && styles.optionChipWrong,
                    ]}
                    onPress={() => handleSelectOption(blankIndex, word)}
                    disabled={revealed}
                  >
                    <Text style={[styles.optionChipText, (showCorrect || showWrong) && { color: '#fff' }]}>{word}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {!revealed ? (
          <Pressable
            style={[styles.checkBtn, !allFilled && styles.checkBtnDisabled]}
            onPress={handleCheck}
            disabled={!allFilled}
          >
            <Text style={styles.checkBtnText}>Check</Text>
          </Pressable>
        ) : (
          <View style={styles.resultBlock}>
            <Text style={styles.resultText}>
              {correctCount === blanks.length ? '✓ Correct!' : `${correctCount} / ${blanks.length} correct`}
            </Text>
            {correctCount === blanks.length && verse.meaning_en ? (
              <Text style={styles.meaningHint}>"{verse.meaning_en}"</Text>
            ) : null}
            <Pressable style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>{index + 1 < verses.length ? 'Next verse →' : 'See results'}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.dotsRow}>
          {verses.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  screenGradient: { ...StyleSheet.absoluteFillObject },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.screenGradientStart,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingRight: spacing.sm, gap: 4 },
  backBtnPressed: { opacity: 0.6 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: typography.semibold },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textDark },
  scoreBadge: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.sm },
  scoreText: { fontSize: typography.small, fontWeight: typography.bold, color: colors.textOnPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.screen, paddingTop: spacing.lg },
  error: { color: colors.primary, marginBottom: spacing.md },
  backBtnStandalone: { marginTop: spacing.md },
  difficultyRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  diffChip: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radii.md, borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.chipBg },
  diffChipActive: { backgroundColor: colors.primary },
  diffChipText: { fontSize: typography.small, fontWeight: typography.semibold, color: colors.primary },
  diffChipTextActive: { color: colors.textOnPrimary },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  statBox: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: spacing.sm, backgroundColor: colors.cardBg, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderTint },
  statValue: { fontSize: typography.base, fontWeight: typography.bold, color: colors.textDark },
  statLabel: { fontSize: typography.caption, color: colors.textMuted },
  verseLabel: { fontSize: typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  verseBlock: { marginBottom: spacing.lg },
  verseCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderTint,
    ...shadows.card,
  },
  lineWithBlanks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
  blankLineText: { fontSize: typography.base, color: colors.textBrown },
  blankSlot: { paddingHorizontal: 4 },
  blankFilled: { fontSize: typography.base, color: colors.primary, fontWeight: typography.semibold },
  blankWrong: { color: colors.primary, textDecorationLine: 'line-through' },
  blankDashed: { width: 48, height: 20, borderBottomWidth: 2, borderBottomColor: colors.primary, marginHorizontal: 2 },
  hintBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.chipBg, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderTint, marginBottom: spacing.lg },
  hintText: { flex: 1, fontSize: typography.small, color: colors.textDark, fontStyle: 'italic' },
  optionsBlock: { marginBottom: spacing.lg },
  optionLabel: { fontSize: typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  optionChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.chipBg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.chip,
  },
  optionChipSelected: { borderColor: colors.primary, backgroundColor: 'rgba(192,57,43,0.1)' },
  optionChipCorrect: { backgroundColor: colors.accentGreen, borderColor: colors.accentGreen },
  optionChipWrong: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionChipText: { fontSize: typography.small, color: colors.textDark },
  checkBtn: { marginTop: spacing.lg, paddingVertical: spacing.md, borderRadius: radii.md, backgroundColor: colors.primary, alignItems: 'center' },
  checkBtnDisabled: { opacity: 0.5 },
  checkBtnText: { fontSize: typography.base, fontWeight: typography.semibold, color: '#fff' },
  resultBlock: { marginTop: spacing.lg },
  resultText: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.textDark, textAlign: 'center', marginBottom: spacing.sm },
  meaningHint: { fontSize: typography.small, color: colors.textMuted, fontStyle: 'italic', marginBottom: spacing.md },
  nextBtn: { paddingVertical: spacing.md, borderRadius: radii.md, backgroundColor: colors.accentGreen, alignItems: 'center' },
  nextBtnText: { fontSize: typography.base, fontWeight: typography.semibold, color: '#fff' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing.lg },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.primary, width: 8, height: 8, borderRadius: 4 },
});
