import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  Dimensions,
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
import { getKuralById } from '../../lib/thirukuralApi';

const PAD = spacing.screen;
const THIRUVALLUVAR_IMAGE = require('../../../assets/thiruvalluvar.png');
const CARD_GAP = spacing.sm;

/** Today's kural: same for the whole day (day-of-year % 1330 + 1). */
function getTodayKuralId() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return (dayOfYear % 1330) + 1;
}

export default function ThirukuralHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const [sections, setSections] = useState([]);
  const [todayKural, setTodayKural] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getKuralById(getTodayKuralId())
      .then(({ kural }) => { setTodayKural(kural || null); setLoading(false); })
      .catch((e) => { setError(e?.message || 'Failed to load'); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={screenGradientColors} style={styles.screenGradient} />

      {/* Header: centered icon, Tamil title, subtitle (theme-aligned) */}
      <View style={[styles.header, { paddingTop: topMargin }]}>
        <View style={styles.headerCenter}>
          <View style={styles.logoWrap}>
            <Ionicons name="compass" size={36} color={colors.primary} />
          </View>
          <Text style={styles.titleTa}>திருக்குறள்</Text>
          <Text style={styles.subtitle}>THIRUKURAL · 1330 KURALS</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Thiruvalluvar image centered, no background */}
        <View style={styles.heroImageWrap}>
          <Image source={THIRUVALLUVAR_IMAGE} style={styles.heroImage} resizeMode="contain" />
        </View>

        <View style={styles.starRow}>
          <Ionicons name="star" size={14} color={colors.gold} />
        </View>

        {/* Card grid: Chapters | Search */}
        <View style={styles.cardRow}>
<Pressable
            style={({ pressed }) => [styles.featureCard, pressed && styles.cardPressed]}
            onPress={() => navigation.getParent()?.navigate('ThirukuralAdhigaramList')}
          >
            <LinearGradient colors={[colors.primaryDark, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureCardGradient}>
              <Ionicons name="library-outline" size={28} color={colors.gold} style={styles.cardIcon} />
              <Text style={styles.cardTitleTa}>அதிகாரம்</Text>
              <Text style={styles.cardSubEn}>133 Chapters</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.featureCard, pressed && styles.cardPressed]}
            onPress={() => navigation.getParent()?.navigate('ThirukuralAdhigaramList')}
          >
            <LinearGradient colors={[colors.accentWarm, colors.accentBrown]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureCardGradient}>
              <Ionicons name="search-outline" size={28} color={colors.gold} style={styles.cardIcon} />
              <Text style={styles.cardTitleTa}>தேடல்</Text>
              <Text style={styles.cardSubEn}>Search Kurals</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Daily Kural | Progress */}
        <View style={styles.cardRow}>
          <Pressable
            style={({ pressed }) => [styles.featureCard, pressed && styles.cardPressed]}
            onPress={() => todayKural && navigation.getParent()?.navigate('ThirukuralDetail', { kuralId: todayKural.id })}
          >
            <LinearGradient colors={[colors.accentForest, colors.accentGreen]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureCardGradient}>
              <Ionicons name="dice-outline" size={28} color={colors.gold} style={styles.cardIcon} />
              <Text style={styles.cardTitleTa}>தினக்குறள்</Text>
              <Text style={styles.cardSubEn}>Daily Kural</Text>
            </LinearGradient>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.featureCard, pressed && styles.cardPressed]}
            onPress={() => navigation.getParent()?.navigate('ThirukuralAdhigaramList')}
          >
            <LinearGradient colors={[colors.accentPurple, colors.navy]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureCardGradient}>
              <Ionicons name="bar-chart-outline" size={28} color={colors.gold} style={styles.cardIcon} />
              <Text style={styles.cardTitleTa}>புள்ளி</Text>
              <Text style={styles.cardSubEn}>Progress</Text>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Quiz: full width */}
        <Pressable
          style={({ pressed }) => [styles.featureCard, pressed && styles.cardPressed]}
          onPress={() => navigation.getParent()?.navigate('ThirukuralPlay', { difficulty: 'easy' })}
        >
          <LinearGradient colors={[colors.navy, colors.navyDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureCardGradientWide}>
            <Ionicons name="ellipse-outline" size={26} color={colors.gold} />
            <View style={styles.quizCardText}>
              <Text style={styles.cardTitleTa}>வினாடி வினா · Quiz</Text>
              <Text style={styles.cardSubEn}>Easy · Medium · Hard</Text>
            </View>
          </LinearGradient>
        </Pressable>

        {/* Today's Kural */}
        <View style={styles.todaySection}>
          <Pressable
            style={({ pressed }) => [styles.todayCard, pressed && styles.cardPressed]}
            onPress={() => todayKural && navigation.getParent()?.navigate('ThirukuralDetail', { kuralId: todayKural.id })}
          >
            <View style={styles.todayCardHeader}>
              <Text style={styles.todayLabel}>TODAY'S KURAL</Text>
              <Text style={styles.todayLabelTa}>குறள் #{todayKural?.id ?? '—'}</Text>
            </View>
            {todayKural ? (
              <>
                <Text style={styles.todayLine1}>{todayKural.line1_ta}</Text>
                <Text style={styles.todayLine2}>{todayKural.line2_ta}</Text>
              </>
            ) : (
              <Text style={styles.todayPlaceholder}>Load a kural from the chapters or play quiz.</Text>
            )}
          </Pressable>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  screenGradient: { ...StyleSheet.absoluteFillObject },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: PAD,
    paddingBottom: spacing.md,
    backgroundColor: colors.screenGradientStart,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  headerCenter: { alignItems: 'center' },
  logoWrap: { marginBottom: spacing.sm },
  titleTa: { fontSize: 28, fontWeight: typography.extrabold, color: colors.primary, letterSpacing: 0.5 },
  subtitle: { fontSize: typography.caption, color: colors.textMuted, marginTop: 4, letterSpacing: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: PAD, paddingTop: spacing.lg },
  error: { color: colors.primary, marginBottom: spacing.sm },
  heroImageWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroImage: {
    width: 200,
    height: 240,
  },
  starRow: { alignItems: 'center', marginBottom: spacing.md },
  cardRow: { flexDirection: 'row', gap: CARD_GAP, marginBottom: CARD_GAP },
  featureCard: { flex: 1, borderRadius: radii.lg, overflow: 'hidden', ...shadows.card },
  cardPressed: { opacity: 0.9 },
  featureCardGradient: {
    padding: spacing.md,
    minHeight: 100,
    justifyContent: 'flex-end',
  },
  featureCardGradientWide: {
    padding: spacing.md,
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quizCardText: { flex: 1 },
  cardIcon: { position: 'absolute', top: spacing.md, right: spacing.md },
  cardTitleTa: { fontSize: typography.base, fontWeight: typography.bold, color: colors.textOnPrimary },
  cardSubEn: { fontSize: typography.caption, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  todaySection: { marginTop: spacing.lg },
  todayCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderTint,
    ...shadows.cardCarousel,
  },
  todayCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  todayLabel: { fontSize: 11, fontWeight: typography.bold, color: colors.textMuted, letterSpacing: 1 },
  todayLabelTa: { fontSize: typography.caption, color: colors.primary },
  todayLine1: { fontSize: typography.base, color: colors.textDark, lineHeight: 24 },
  todayLine2: { fontSize: typography.base, color: colors.textBrown, lineHeight: 24, marginTop: spacing.xs },
  todayPlaceholder: { fontSize: typography.small, color: colors.textMuted, fontStyle: 'italic' },
});
