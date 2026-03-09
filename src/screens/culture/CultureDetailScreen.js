import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { getItemDetail, getTermsForItem } from '../../lib/cultureApi';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getReadTimeMinutes(infoEn) {
  if (!infoEn || typeof infoEn !== 'string') return 1;
  const words = infoEn.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Split story text into segments; segments that match a keyword get { highlight: true }. */
function getStorySegments(text, terms) {
  if (!text || !terms?.length) return [{ highlight: false, text: text || '' }];
  const phrases = [...terms]
    .map((t) => ({ en: (t.term_en || '').trim(), ta: (t.term_ta || '').trim() }))
    .filter((p) => p.en || p.ta);
  if (phrases.length === 0) return [{ highlight: false, text }];
  const byLength = [...phrases].flatMap((p) => [p.en, p.ta].filter(Boolean)).filter((s) => s.length > 0);
  byLength.sort((a, b) => b.length - a.length);
  const escaped = byLength.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp('(' + escaped.join('|') + ')', 'gi');
  const segments = [];
  let lastIndex = 0;
  let match;
  const reCopy = new RegExp(re.source, re.flags);
  while ((match = reCopy.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ highlight: false, text: text.slice(lastIndex, match.index) });
    }
    segments.push({ highlight: true, text: match[0] });
    lastIndex = reCopy.lastIndex;
  }
  if (lastIndex < text.length) segments.push({ highlight: false, text: text.slice(lastIndex) });
  return segments.length ? segments : [{ highlight: false, text }];
}

export default function CultureDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { itemId, itemName, level } = route.params ?? {};
  const [item, setItem] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandReadMore, setExpandReadMore] = useState(false);

  // Match game: tap Tamil then English to pair; Test yourself verifies
  const [selectedTamilIndex, setSelectedTamilIndex] = useState(null);
  const [pairs, setPairs] = useState({});
  const [verified, setVerified] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const shuffledEnglish = useMemo(() => {
    if (!terms.length) return [];
    return shuffle(terms.map((t) => t.term_en));
  }, [terms]);

  const correctMap = useMemo(() => {
    if (!terms.length || !shuffledEnglish.length) return {};
    const m = {};
    terms.forEach((t, i) => {
      m[i] = shuffledEnglish.indexOf(t.term_en);
    });
    return m;
  }, [terms, shuffledEnglish]);

  const usedEnglishIndices = useMemo(() => new Set(Object.values(pairs)), [pairs]);
  const allPaired = terms.length > 0 && Object.keys(pairs).length >= terms.length;

  const onSelectTamil = (i) => {
    if (verified) return;
    setSelectedTamilIndex((prev) => (prev === i ? null : i));
  };

  const onSelectEnglish = (j) => {
    if (verified || selectedTamilIndex === null) return;
    if (usedEnglishIndices.has(j)) return;
    setPairs((prev) => ({ ...prev, [selectedTamilIndex]: j }));
    setSelectedTamilIndex(null);
  };

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    setVerified(false);
    setVerificationResult(null);
    setPairs({});
    setSelectedTamilIndex(null);
    Promise.all([getItemDetail(itemId), getTermsForItem(itemId)]).then(([detailRes, termsRes]) => {
      setItem(detailRes.item || null);
      setTerms(termsRes.terms || []);
      setLoading(false);
    });
  }, [itemId]);

  const topMargin = Math.max(insets.top, spacing.lg);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Tabs', { screen: 'Culture' });
  };

  const handleVerify = () => {
    const result = {};
    terms.forEach((_, i) => {
      result[i] = pairs[i] === correctMap[i];
    });
    setVerificationResult(result);
    setVerified(true);
  };

  const handleStartQuiz = () => {
    navigation.navigate('CultureQuiz', { itemId, itemName, level: level ?? item?.level ?? 'beginner' });
  };

  const resetMatch = () => {
    setPairs({});
    setVerified(false);
    setVerificationResult(null);
    setSelectedTamilIndex(null);
  };

  if (loading) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.wrapper}>
        <View style={[styles.headerBar, { paddingTop: topMargin }]}>
          <Pressable style={styles.backBtn} onPress={handleBack}>
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          </Pressable>
          <Text style={styles.headerTitle} numberOfLines={1}>Tamil Culture & Stories</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>Story not found.</Text>
        </View>
      </View>
    );
  }

  const readTime = getReadTimeMinutes(item.info_en);
  const snippetLength = 300;
  const showReadMore = (item.info_en || '').length > snippetLength && !expandReadMore;
  const displayInfo = showReadMore
    ? (item.info_en || '').slice(0, snippetLength).trim() + '...'
    : (item.info_en || '');

  const verifyScore = verificationResult
    ? Object.values(verificationResult).filter(Boolean).length
    : 0;

  return (
    <View style={styles.wrapper}>
      <View style={[styles.headerBar, { paddingTop: topMargin }]}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={handleBack}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Tamil Culture & Stories</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentCard}>
          {item.categoryName ? (
            <View style={styles.categoryPill}>
              <Ionicons name="business-outline" size={14} color={colors.textOnPrimary} />
              <Text style={styles.categoryPillText}>{item.categoryName}</Text>
            </View>
          ) : null}
          <Text style={styles.titleEn}>{item.name_en}</Text>
          {item.name_ta ? <Text style={styles.titleTa}>{item.name_ta}</Text> : null}

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{readTime} min read</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{(item.level || level || 'beginner').charAt(0).toUpperCase() + (item.level || level || 'beginner').slice(1)}</Text>
            </View>
          </View>

          <Text style={styles.infoText}>
            {getStorySegments(displayInfo, terms).map((seg, i) =>
              seg.highlight ? (
                <Text key={i} style={styles.infoTextHighlight}>{seg.text}</Text>
              ) : (
                <Text key={i}>{seg.text}</Text>
              )
            )}
          </Text>
          {showReadMore ? (
            <TouchableOpacity onPress={() => setExpandReadMore(true)} style={styles.readMoreBtn}>
              <Text style={styles.readMoreText}>Read More →</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Words in this story: tap to match, then Test yourself to verify */}
        {terms.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="library-outline" size={20} color={colors.success} />
              <Text style={styles.sectionTitle}>Words in this story</Text>
            </View>
            <Text style={styles.sectionHint}>Tap a Tamil word, then tap its English meaning below. Then tap "Test yourself" to verify.</Text>

            <View style={styles.matchRows}>
              {terms.map((t, i) => (
                <View key={i} style={styles.matchRow}>
                  <TouchableOpacity
                    style={[
                      styles.chip,
                      styles.chipTamil,
                      selectedTamilIndex === i && styles.chipSelected,
                      verified && verificationResult && (verificationResult[i] ? styles.chipCorrect : styles.chipWrong),
                    ]}
                    onPress={() => onSelectTamil(i)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chipText} numberOfLines={1}>{t.term_ta}</Text>
                  </TouchableOpacity>
                  <Text style={styles.matchArrow}>→</Text>
                  <View
                    style={[
                      styles.chip,
                      styles.chipSlot,
                      pairs[i] !== undefined && styles.chipFilled,
                      verified && verificationResult && (verificationResult[i] ? styles.chipCorrect : styles.chipWrong),
                    ]}
                  >
                    <Text style={styles.chipText} numberOfLines={1}>
                      {pairs[i] !== undefined ? shuffledEnglish[pairs[i]] : 'Tap to match'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.englishPool}>
              <Text style={styles.englishPoolLabel}>Tap a meaning below to pair with the selected Tamil word:</Text>
              <View style={styles.englishPoolWrap}>
                {shuffledEnglish.map((en, j) => (
                  <TouchableOpacity
                    key={j}
                    style={[
                      styles.chip,
                      styles.chipEnglish,
                      usedEnglishIndices.has(j) && !verified && styles.chipUsed,
                      selectedTamilIndex !== null && !usedEnglishIndices.has(j) && styles.chipDropTarget,
                    ]}
                    onPress={() => onSelectEnglish(j)}
                    disabled={usedEnglishIndices.has(j) && !verified}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.chipTextSmall} numberOfLines={1}>{en}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {verified && (
              <View style={styles.scoreWrap}>
                <Ionicons name={verifyScore === terms.length ? 'checkmark-circle' : 'information-circle'} size={24} color={verifyScore === terms.length ? colors.success : colors.primary} />
                <Text style={styles.scoreText}>
                  {verifyScore} / {terms.length} correct
                </Text>
              </View>
            )}

            <View style={styles.actionsRow}>
              {verified ? (
                <>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={resetMatch}>
                    <Text style={styles.secondaryBtnText}>Match again</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.primaryBtn} onPress={handleStartQuiz}>
                    <Text style={styles.primaryBtnText}>Start quiz</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.textOnPrimary} />
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.secondaryBtn} onPress={resetMatch}>
                    <Text style={styles.secondaryBtnText}>Reset</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.primaryBtn, !allPaired && styles.primaryBtnDisabled]}
                    onPress={handleVerify}
                    disabled={!allPaired}
                  >
                    <Text style={styles.primaryBtnText}>Test yourself</Text>
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.textOnPrimary} />
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

        {terms.length > 0 && (
          <View style={[styles.section, { marginTop: spacing.md }]}>
            <TouchableOpacity style={styles.quizCard} onPress={handleStartQuiz} activeOpacity={0.85}>
              <Text style={styles.quizCardText}>Take full quiz with these words</Text>
              <Ionicons name="arrow-forward" size={22} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: spacing.xxl * 2 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.screenBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  backBtn: { paddingVertical: spacing.md, paddingRight: spacing.md },
  backBtnPressed: { opacity: 0.6 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: colors.textDark, textAlign: 'center' },
  headerSpacer: { width: 36 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingBottom: spacing.xxl },
  contentCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 20,
    gap: 6,
    marginBottom: spacing.md,
  },
  categoryPillText: { fontSize: typography.small, color: colors.textOnPrimary, fontWeight: '600' },
  titleEn: { fontSize: 24, fontWeight: '700', color: colors.textDark },
  titleTa: { fontSize: 16, color: colors.textMuted, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: typography.small, color: colors.textMuted },
  infoText: {
    fontSize: typography.body,
    color: colors.textDark,
    lineHeight: 24,
    marginTop: spacing.lg,
  },
  infoTextHighlight: {
    backgroundColor: colors.orange ? `${colors.orange}30` : '#F4C43030',
    color: colors.textBrown,
  },
  readMoreBtn: { marginTop: spacing.sm },
  readMoreText: { fontSize: typography.sub, color: colors.primary, fontWeight: '600' },

  section: { paddingHorizontal: 0, marginTop: spacing.section },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: colors.textDark },
  sectionHint: { fontSize: typography.small, color: colors.textMuted, marginBottom: spacing.lg, lineHeight: 20 },

  matchRows: { gap: spacing.sm },
  matchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  chip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipTamil: { flex: 1 },
  chipSlot: { flex: 1, backgroundColor: colors.screenBg },
  chipFilled: { backgroundColor: colors.cardBg },
  chipEnglish: { backgroundColor: colors.cardBg },
  chipSelected: { borderColor: colors.primary, borderWidth: 2, backgroundColor: `${colors.primary}15` },
  chipDropTarget: { borderColor: colors.primary, borderWidth: 2, backgroundColor: `${colors.primary}10` },
  chipUsed: { opacity: 0.6 },
  chipCorrect: { borderColor: colors.success, backgroundColor: `${colors.success}18` },
  chipWrong: { borderColor: colors.primary, backgroundColor: `${colors.primary}18` },
  chipText: { fontSize: typography.sub, color: colors.textDark, fontWeight: '500' },
  chipTextSmall: { fontSize: typography.small, color: colors.textDark },

  englishPool: { marginTop: spacing.xl },
  englishPoolLabel: { fontSize: typography.small, color: colors.textMuted, marginBottom: spacing.sm },
  englishPoolWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

  scoreWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: spacing.xl },
  scoreText: { fontSize: 16, fontWeight: '600', color: colors.textDark },

  actionsRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, alignItems: 'center' },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 16, fontWeight: '600', color: colors.textOnPrimary },
  secondaryBtn: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryBtnText: { fontSize: 16, fontWeight: '600', color: colors.textDark },

  quizCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    padding: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quizCardText: { fontSize: 16, fontWeight: '600', color: colors.textDark },

  errorWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.screen },
  errorText: { color: colors.textMuted },
});
