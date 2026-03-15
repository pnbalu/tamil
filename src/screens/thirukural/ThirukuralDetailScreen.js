import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  colors,
  spacing,
  typography,
  shadows,
  screenGradientColors,
  toggleActiveGradientColors,
} from '../../theme';
import { radii } from '../../theme/radii';
import { getKuralById } from '../../lib/thirukuralApi';

function DetailSection({ title, titleTa, children, accentColor = colors.primary }) {
  return (
    <View style={styles.meaningBlock}>
      <View style={styles.meaningLabelRow}>
        <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
        <Text style={styles.meaningLabel}>{title}</Text>
        {titleTa ? <Text style={styles.meaningLabelTa}> {titleTa}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export default function ThirukuralDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const { kuralId } = route.params ?? {};
  const [kural, setKural] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [langSlide, setLangSlide] = useState('en'); // 'en' | 'ta'

  useEffect(() => {
    if (!kuralId) return;
    getKuralById(kuralId).then(({ kural: k, error: e }) => {
      setKural(k || null);
      setError(e || null);
      setLoading(false);
    });
  }, [kuralId]);

  const handleBack = () => navigation.goBack();

  if (loading) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !kural) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <Text style={styles.error}>{error || 'Kural not found'}</Text>
        <Pressable onPress={handleBack} style={styles.backBtnStandalone}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    );
  }

  const exampleEn = kural.example_en;
  const exampleTa = kural.example_ta;
  const storyEn = kural.story_en;
  const storyTa = kural.story_ta;

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={screenGradientColors} style={styles.screenGradient} />
      <View style={[styles.headerBar, { paddingTop: topMargin }]}>
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={handleBack} hitSlop={12}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Verse {kural.id}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.verseBlock}>
          <LinearGradient colors={[colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.verseCard}>
            <Text style={styles.verseLine1}>{kural.line1_ta}</Text>
            <Text style={styles.verseLine2}>{kural.line2_ta}</Text>
          </LinearGradient>
        </View>

        {/* Tamil / English slide toggle */}
        <View style={styles.langSlideWrap}>
          <Pressable
            style={[styles.langSlideBtn, langSlide === 'en' && styles.langSlideBtnActive]}
            onPress={() => setLangSlide('en')}
          >
            {langSlide === 'en' ? (
              <LinearGradient colors={toggleActiveGradientColors} style={styles.langSlideGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            ) : null}
            <Text style={[styles.langSlideText, langSlide === 'en' && styles.langSlideTextActive]}>English</Text>
          </Pressable>
          <Pressable
            style={[styles.langSlideBtn, langSlide === 'ta' && styles.langSlideBtnActive]}
            onPress={() => setLangSlide('ta')}
          >
            {langSlide === 'ta' ? (
              <LinearGradient colors={toggleActiveGradientColors} style={styles.langSlideGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
            ) : null}
            <Text style={[styles.langSlideText, langSlide === 'ta' && styles.langSlideTextActive]}>தமிழ்</Text>
          </Pressable>
        </View>

        {langSlide === 'en' && (
          <>
            {kural.meaning_en ? (
              <DetailSection title="Meaning" accentColor={colors.primary}>
                <Text style={styles.meaningText}>{kural.meaning_en}</Text>
              </DetailSection>
            ) : null}
            {kural.explanation_en ? (
              <DetailSection title="Explanation" accentColor={colors.orange}>
                <Text style={styles.meaningText}>{kural.explanation_en}</Text>
              </DetailSection>
            ) : null}
            {exampleEn ? (
              <DetailSection title="Example" accentColor={colors.accentGreen}>
                <Text style={styles.meaningText}>{exampleEn}</Text>
              </DetailSection>
            ) : null}
            {storyEn ? (
              <DetailSection title="Story" accentColor={colors.accentPurple}>
                <Text style={styles.meaningText}>{storyEn}</Text>
              </DetailSection>
            ) : null}
          </>
        )}

        {langSlide === 'ta' && (
          <>
            {exampleTa ? (
              <DetailSection title="உதாரணம்" accentColor={colors.accentGreen}>
                <Text style={styles.meaningTextTa}>{exampleTa}</Text>
              </DetailSection>
            ) : null}
            {storyTa ? (
              <DetailSection title="கதை" accentColor={colors.accentPurple}>
                <Text style={styles.meaningTextTa}>{storyTa}</Text>
              </DetailSection>
            ) : null}
            {!exampleTa && !storyTa ? (
              <Text style={styles.noContentTa}>தமிழ் உள்ளடக்கம் இந்த குறளுக்கு இன்னும் சேர்க்கப்படவில்லை.</Text>
            ) : null}
          </>
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
  backBtn: { paddingVertical: spacing.sm, paddingRight: spacing.sm },
  backBtnPressed: { opacity: 0.6 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: typography.semibold },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textDark },
  headerSpacer: { width: 72 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.screen, paddingTop: spacing.lg },
  error: { color: colors.primary, marginBottom: spacing.md },
  backBtnStandalone: { marginTop: spacing.md },
  verseBlock: { marginBottom: spacing.lg },
  langSlideWrap: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    backgroundColor: colors.chipBg,
    borderRadius: radii.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.chip,
  },
  langSlideBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    overflow: 'hidden',
    position: 'relative',
  },
  langSlideBtnActive: {},
  langSlideGradient: { ...StyleSheet.absoluteFillObject },
  langSlideText: { fontSize: typography.small, fontWeight: typography.semibold, color: colors.textMuted },
  langSlideTextActive: { color: '#fff' },
  noContentTa: { fontSize: typography.small, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing.sm },
  verseCard: {
    borderRadius: radii.lg,
    padding: spacing.lg,
    ...shadows.cardCarousel,
  },
  verseLine1: { fontSize: typography.h3, color: '#fff', textAlign: 'center', lineHeight: 32 },
  verseLine2: { fontSize: typography.h3, color: 'rgba(255,255,255,0.95)', textAlign: 'center', marginTop: spacing.sm, lineHeight: 32 },
  meaningBlock: { marginBottom: spacing.lg },
  meaningLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm, flexWrap: 'wrap' },
  accentLine: { width: 4, height: 20, borderRadius: 2 },
  meaningLabel: { fontSize: typography.small, fontWeight: typography.bold, color: colors.textMuted },
  meaningLabelTa: { fontSize: typography.small, color: colors.primary },
  meaningText: { fontSize: typography.base, color: colors.textDark, lineHeight: 24 },
  meaningTextTa: { fontSize: typography.base, color: colors.textBrown, lineHeight: 24 },
  langLabel: { fontSize: typography.caption, fontWeight: typography.semibold, color: colors.textMuted, marginBottom: spacing.xs },
});
