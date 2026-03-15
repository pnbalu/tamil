import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, shadows, screenGradientColors } from '../../theme';
import { radii } from '../../theme/radii';
import { getVerseById } from '../../lib/aathichudiApi';

const SAVED_KEY = 'aathichudi_saved_verses';

function DetailSection({ title, titleTa, children, accentColor = colors.primary }) {
  return (
    <View style={styles.meaningBlock}>
      <View style={styles.meaningLabelRow}>
        <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
        <Text style={styles.meaningLabel}>{title}</Text>
        {titleTa ? <Text style={styles.meaningLabelTa}> · {titleTa}</Text> : null}
      </View>
      {children}
    </View>
  );
}

export default function AathichudiDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const { verseId } = route.params ?? {};
  const [verse, setVerse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const loadVerse = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    const { verse: v, error: e } = await getVerseById(id);
    setVerse(v || null);
    setError(e || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadVerse(verseId);
  }, [verseId, loadVerse]);

  useEffect(() => {
    if (!verseId) return;
    AsyncStorage.getItem(SAVED_KEY).then((raw) => {
      try {
        const ids = raw ? JSON.parse(raw) : [];
        setSaved(ids.includes(verseId));
      } catch {
        setSaved(false);
      }
    });
  }, [verseId]);

  const handleBack = () => navigation.goBack();
  const handlePrev = () => {
    if (verse && verse.id > 1) navigation.setParams({ verseId: verse.id - 1 });
  };
  const handleNext = () => {
    if (verse && verse.id < 109) navigation.setParams({ verseId: verse.id + 1 });
  };
  const toggleSaved = async () => {
    try {
      const raw = await AsyncStorage.getItem(SAVED_KEY);
      const ids = raw ? JSON.parse(raw) : [];
      const next = saved ? ids.filter((id) => id !== verseId) : [...ids, verseId];
      await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(next));
      setSaved(!saved);
    } catch (_) {}
  };

  if (loading && !verse) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error && !verse) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <Text style={styles.error}>{error || 'Verse not found'}</Text>
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
          <Text style={styles.headerTitle}>ஆத்திசூடி</Text>
          <Text style={styles.headerSub}>Aathichudi — Avvaiyar</Text>
        </View>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeText}>#{verse.id}</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.verseOfLabel}>வரி {verse.id} OF 109</Text>
        <View style={styles.verseBlock}>
          <LinearGradient colors={[colors.primary, colors.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.verseCard}>
            <Text style={styles.verseLine}>{verse.line_ta}</Text>
          </LinearGradient>
        </View>

        {verse.meaning_en ? (
          <DetailSection title="பொருள்" titleTa="MEANING" accentColor={colors.primary}>
            <Text style={[styles.meaningText, styles.meaningItalic]}>{verse.meaning_en}</Text>
          </DetailSection>
        ) : null}
        {verse.explanation_en ? (
          <DetailSection title="விளக்கம்" titleTa="EXPLANATION" accentColor={colors.orange}>
            <Text style={styles.meaningText}>{verse.explanation_en}</Text>
          </DetailSection>
        ) : null}

        <View style={styles.navRow}>
          <Pressable style={[styles.navBtn, verse.id <= 1 && styles.navBtnDisabled]} onPress={handlePrev} disabled={verse.id <= 1}>
            <Ionicons name="chevron-back" size={24} color={verse.id > 1 ? colors.primary : colors.textMuted} />
          </Pressable>
          <View style={styles.navCenter}>
            <Text style={styles.navNum}>{verse.id} / 109</Text>
            <Text style={styles.navTitle}>ஆத்திசூடி</Text>
          </View>
          <Pressable style={[styles.navBtn, verse.id >= 109 && styles.navBtnDisabled]} onPress={handleNext} disabled={verse.id >= 109}>
            <Ionicons name="chevron-forward" size={24} color={verse.id < 109 ? colors.primary : colors.textMuted} />
          </Pressable>
        </View>

        <Pressable style={[styles.saveBtn, saved && styles.saveBtnActive]} onPress={toggleSaved}>
          <Ionicons name={saved ? 'heart' : 'heart-outline'} size={20} color={saved ? colors.textOnPrimary : colors.primary} />
          <Text style={[styles.saveBtnText, saved && { color: colors.textOnPrimary }]}>Save to Favourites</Text>
        </Pressable>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  screenGradient: { ...StyleSheet.absoluteFillObject },
  centered: { justifyContent: 'center', alignItems: 'center' },
  headerBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingBottom: spacing.md, backgroundColor: colors.screenGradientStart, borderBottomWidth: 1, borderBottomColor: colors.border },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingRight: spacing.sm, gap: 4 },
  backBtnPressed: { opacity: 0.6 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: typography.semibold },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textDark },
  headerSub: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  badgeWrap: { backgroundColor: colors.primary, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radii.sm },
  badgeText: { fontSize: typography.small, fontWeight: typography.bold, color: colors.textOnPrimary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.screen, paddingTop: spacing.lg },
  error: { color: colors.primary, marginBottom: spacing.md },
  backBtnStandalone: { marginTop: spacing.md },
  verseOfLabel: { fontSize: typography.caption, color: colors.textMuted, marginBottom: spacing.sm },
  verseBlock: { marginBottom: spacing.lg },
  verseCard: { borderRadius: radii.lg, padding: spacing.lg, ...shadows.cardCarousel },
  verseLine: { fontSize: typography.h3, color: '#fff', textAlign: 'center', lineHeight: 32 },
  meaningBlock: { marginBottom: spacing.lg },
  meaningLabelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm, flexWrap: 'wrap' },
  accentLine: { width: 4, height: 20, borderRadius: 2 },
  meaningLabel: { fontSize: typography.small, fontWeight: typography.bold, color: colors.textMuted },
  meaningLabelTa: { fontSize: typography.small, color: colors.primary },
  meaningText: { fontSize: typography.base, color: colors.textDark, lineHeight: 24 },
  meaningItalic: { fontStyle: 'italic' },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: colors.cardBg, borderRadius: radii.md, borderWidth: 1, borderColor: colors.borderTint },
  navBtn: { padding: spacing.sm },
  navBtnDisabled: { opacity: 0.5 },
  navCenter: { alignItems: 'center' },
  navNum: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textDark },
  navTitle: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md, paddingVertical: spacing.md, borderRadius: radii.md, borderWidth: 1, borderColor: colors.primary, backgroundColor: 'transparent' },
  saveBtnActive: { backgroundColor: colors.primary },
  saveBtnText: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.primary },
});
