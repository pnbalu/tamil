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
  accentBarGradientColors,
} from '../../theme';
import { radii } from '../../theme/radii';
import {
  getRandomKuralsForPlay,
  buildBlanksForLine,
  getWordPoolForOptions,
} from '../../lib/thirukuralApi';

const WORDS_TO_HIDE = { easy: 1, medium: 2, hard: 3 };

export default function ThirukuralPlayScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const difficulty = route.params?.difficulty || 'easy';
  const wordsToHide = WORDS_TO_HIDE[difficulty] ?? 1;

  const [kurals, setKurals] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optionsPerBlank, setOptionsPerBlank] = useState([]);
  const [selectedBlanks, setSelectedBlanks] = useState({});
  const [revealed, setRevealed] = useState(false);

  const kural = kurals[index];
  const lineToUse = kural?.line1_ta || '';
  const { displayParts, blanks } = kural
    ? buildBlanksForLine(lineToUse, wordsToHide, kural.id)
    : { displayParts: [], blanks: [] };

  const loadGame = useCallback(async () => {
    setLoading(true);
    const { kurals: k, error: e } = await getRandomKuralsForPlay(15, difficulty);
    setKurals(k || []);
    setError(e || null);
    setIndex(0);
    setSelectedBlanks({});
    setRevealed(false);
    setLoading(false);
  }, [difficulty]);

  useEffect(() => { loadGame(); }, [loadGame]);

  useEffect(() => {
    if (!kural || blanks.length === 0) {
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
  }, [kural?.id, blanks.length]);

  const handleBack = () => navigation.goBack();
  const handleSelectOption = (blankIndex, word) => {
    if (revealed) return;
    setSelectedBlanks((prev) => ({ ...prev, [blankIndex]: word }));
  };
  const allFilled = blanks.length > 0 && blanks.every((_, i) => selectedBlanks[i] != null);
  const handleCheck = () => {
    if (!allFilled) return;
    setRevealed(true);
  };
  const handleNext = () => {
    if (index + 1 < kurals.length) {
      setIndex((i) => i + 1);
      setSelectedBlanks({});
      setRevealed(false);
      setOptionsPerBlank([]);
    } else {
      loadGame();
    }
  };

  if (loading && kurals.length === 0) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && kurals.length === 0) {
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

  if (!kural) {
    return null;
  }

  const correctCount = blanks.filter((_, i) => selectedBlanks[i] === blanks[i].correctWord).length;

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={screenGradientColors} style={styles.screenGradient} />
      <View style={[styles.headerBar, { paddingTop: topMargin }]}>
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Fill the blanks · {difficulty}</Text>
          <Text style={styles.headerSub}>{index + 1} / {kurals.length}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.verseBlock}>
          <View style={styles.verseCard}>
            <Text style={styles.verseLine2Static}>{kural.line2_ta}</Text>
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
              {correctCount === blanks.length ? '✓ All correct!' : `${correctCount} / ${blanks.length} correct`}
            </Text>
            {kural.meaning_en ? <Text style={styles.meaningHint}>{kural.meaning_en}</Text> : null}
            <Pressable style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>{index + 1 < kurals.length ? 'Next verse' : 'Play again'}</Text>
            </Pressable>
          </View>
        )}
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
  headerSub: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  headerSpacer: { width: 72 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.screen, paddingTop: spacing.lg },
  error: { color: colors.primary, marginBottom: spacing.md },
  backBtnStandalone: { marginTop: spacing.md },
  verseBlock: { marginBottom: spacing.lg },
  verseCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderTint,
    ...shadows.card,
  },
  verseLine2Static: { fontSize: typography.base, color: colors.textDark, textAlign: 'center', marginBottom: spacing.sm },
  lineWithBlanks: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' },
  blankLineText: { fontSize: typography.base, color: colors.textBrown },
  blankSlot: { paddingHorizontal: 4 },
  blankFilled: { fontSize: typography.base, color: colors.primary, fontWeight: typography.semibold },
  blankWrong: { color: colors.primary, textDecorationLine: 'line-through' },
  blankDashed: { width: 48, height: 20, borderBottomWidth: 2, borderBottomColor: colors.textMuted, marginHorizontal: 2 },
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
  checkBtn: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  checkBtnDisabled: { opacity: 0.5 },
  checkBtnText: { fontSize: typography.base, fontWeight: typography.semibold, color: '#fff' },
  resultBlock: { marginTop: spacing.lg },
  resultText: { fontSize: typography.h3, fontWeight: typography.bold, color: colors.textDark, textAlign: 'center', marginBottom: spacing.sm },
  meaningHint: { fontSize: typography.small, color: colors.textMuted, fontStyle: 'italic', marginBottom: spacing.md },
  nextBtn: { paddingVertical: spacing.md, borderRadius: radii.md, backgroundColor: colors.accentGreen, alignItems: 'center' },
  nextBtnText: { fontSize: typography.base, fontWeight: typography.semibold, color: '#fff' },
});
