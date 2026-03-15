import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, shadows, screenGradientColors } from '../../theme';
import { radii } from '../../theme/radii';
import { getVerseById } from '../../lib/aathichudiApi';

const AVVAIYAR_BG = require('../../../assets/avvaiyar-bg.png');
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PAD = spacing.screen;
const CARD_GAP = spacing.sm;

function getTodayVerseId() {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return (dayOfYear % 109) + 1;
}

export default function AathichudiHomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const [todayVerse, setTodayVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getVerseById(getTodayVerseId())
      .then(({ verse }) => {
        setTodayVerse(verse || null);
        setLoading(false);
      })
      .catch((e) => {
        setError(e && e.message ? e.message : 'Failed to load');
        setLoading(false);
      });
  }, []);

  if (loading) {
return (
    <View style={[styles.wrapper, styles.centered]}>
        <View style={[styles.bgImageWrap, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
          <Image source={AVVAIYAR_BG} style={styles.bgImage} resizeMode="cover" />
        </View>
        <View style={styles.bgOverlay} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.bgImageWrap, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]}>
        <Image source={AVVAIYAR_BG} style={styles.bgImage} resizeMode="cover" />
      </View>
      <View style={styles.bgOverlay} />
      <View style={[styles.header, { paddingTop: topMargin }]}>
        <View style={styles.headerCenter}>
          <View style={styles.logoWrap}>
            <Ionicons name="book-outline" size={36} color="#fff" />
          </View>
          <Text style={styles.authorTa}>ஔவையார்</Text>
          <Text style={styles.titleTa}>ஆத்திசூடி</Text>
          <Text style={styles.subtitle}>AATHICHUDI · 109 VERSES</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={({ pressed }) => [styles.featureCardFull, pressed && styles.cardPressed]}
          onPress={() => navigation.getParent() && navigation.getParent().navigate('AathichudiList')}
        >
          <LinearGradient colors={[colors.primaryDark, colors.primary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.featureCardGradient}>
            <Ionicons name="document-text-outline" size={28} color={colors.gold} style={styles.cardIcon} />
            <Text style={styles.cardTitleTa}>அனைத்து வரிகள்</Text>
            <Text style={styles.cardSubEn}>All 109 Verses</Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.quizCard, pressed && styles.cardPressed]}
          onPress={() => navigation.getParent() && navigation.getParent().navigate('AathichudiQuizSetup')}
        >
          <LinearGradient colors={[colors.navy, colors.navyDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quizCardGradient}>
            <Ionicons name="ellipse-outline" size={26} color="#fff" />
            <View style={styles.quizCardText}>
              <Text style={styles.cardTitleTa}>வினாடி வினா · Quiz</Text>
              <Text style={styles.cardSubEn}>Easy · Medium · Hard</Text>
            </View>
          </LinearGradient>
        </Pressable>

        <View style={styles.todaySection}>
          <Pressable
            style={({ pressed }) => [styles.todayCard, pressed && styles.cardPressed]}
            onPress={() => todayVerse && navigation.getParent() && navigation.getParent().navigate('AathichudiDetail', { verseId: todayVerse.id })}
          >
            <View style={styles.todayCardHeader}>
              <Text style={styles.todayLabel}>TODAY'S VERSE</Text>
              <Text style={styles.todayLabelTa}>வரி #{todayVerse ? todayVerse.id : '—'}</Text>
            </View>
            {todayVerse ? (
              <>
                <Text style={styles.todayLine}>{todayVerse.line_ta}</Text>
                {todayVerse.meaning_en ? (
                  <Text style={styles.todayMeaning}>"{todayVerse.meaning_en}"</Text>
                ) : null}
              </>
            ) : (
              <Text style={styles.todayPlaceholder}>Load verses from All 109 Verses.</Text>
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
  bgImageWrap: { position: 'absolute', top: 0, left: 0, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  bgImage: { width: SCREEN_WIDTH, height: SCREEN_HEIGHT },
  bgOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: { paddingHorizontal: PAD, paddingBottom: spacing.md, backgroundColor: 'transparent', alignItems: 'center' },
  headerCenter: { alignItems: 'center' },
  logoWrap: { marginBottom: spacing.sm },
  authorTa: { fontSize: typography.base, color: 'rgba(255,255,255,0.95)', marginBottom: 2 },
  titleTa: { top:300,fontSize: 28, fontWeight: typography.extrabold, color: '#fff', letterSpacing: 0.5, textShadowColor: 'rgba(244,196,48,0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 8 },
  subtitle: { top:300,fontSize: typography.caption, color: 'rgba(255,255,255,0.95)', marginTop: 4, letterSpacing: 1 },
  quizCard: { borderRadius: radii.lg, overflow: 'hidden', marginBottom: CARD_GAP, ...shadows.card },
  quizCardGradient: { padding: spacing.md, minHeight: 88, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  quizCardText: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: PAD, paddingTop: spacing.lg+300 },
  error: { color: '#fff', marginBottom: spacing.sm },
  featureCardFull: { marginBottom: CARD_GAP, borderRadius: radii.lg, overflow: 'hidden', ...shadows.card },
  featureCard: { flex: 1, borderRadius: radii.lg, overflow: 'hidden', ...shadows.card },
  cardPressed: { opacity: 0.9 },
  featureCardGradient: { padding: spacing.md, minHeight: 100, justifyContent: 'flex-end' },
  cardIcon: { position: 'absolute', top: spacing.md, right: spacing.md },
  cardTitleTa: { fontSize: typography.base, fontWeight: typography.bold, color: colors.textOnPrimary },
  cardSubEn: { fontSize: typography.caption, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  todaySection: { marginTop: spacing.lg },
  todayCard: { backgroundColor: colors.screenBg, borderRadius: radii.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadows.cardCarousel },
  todayCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  todayLabel: { fontSize: 11, fontWeight: typography.bold, color: colors.textDark, letterSpacing: 1 },
  todayLabelTa: { fontSize: typography.caption, color: colors.textDark, fontWeight: typography.semibold },
  todayLine: { fontSize: 18, fontWeight: typography.semibold, color: colors.textDark, lineHeight: 26, textAlign: 'center' },
  todayMeaning: { fontSize: typography.small, color: colors.textBrown, fontStyle: 'italic', marginTop: spacing.sm, textAlign: 'center' },
  todayPlaceholder: { fontSize: typography.small, color: colors.textMuted, fontStyle: 'italic', textAlign: 'center' },
});
