import React, { useState, useEffect } from 'react';
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
import { getKuralsByAdhigaram } from '../../lib/thirukuralApi';

export default function ThirukuralAdhigaramScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const { adhigaramId, adhigaramName, adhigaramNameTa } = route.params ?? {};
  const [kurals, setKurals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!adhigaramId) return;
    getKuralsByAdhigaram(adhigaramId).then(({ kurals: k, error: e }) => {
      setKurals(k || []);
      setError(e || null);
      setLoading(false);
    });
  }, [adhigaramId]);

  const handleBack = () => navigation.goBack();

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
      <View style={[styles.headerBar, { paddingTop: topMargin }]}>
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.headerContent}>
          <LinearGradient colors={accentBarGradientColors} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.headerAccentBar} />
          <View style={styles.headerTitleBlock}>
            <Text style={styles.breadcrumb}>Thirukural</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{adhigaramName || 'Chapter'}</Text>
            {adhigaramNameTa ? <Text style={styles.headerTitleTa} numberOfLines={1}>{adhigaramNameTa}</Text> : null}
            <Text style={styles.subtitleInline}>{kurals.length} verses · Tap to read</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {kurals.map((k) => (
          <TouchableOpacity
            key={k.id}
            style={styles.verseCard}
            onPress={() => navigation.navigate('ThirukuralDetail', { kuralId: k.id })}
            activeOpacity={0.85}
          >
            <View style={styles.verseNumWrap}>
              <Text style={styles.verseNum}>{k.id}</Text>
            </View>
            <View style={styles.verseText}>
              <Text style={styles.verseLine1}>{k.line1_ta}</Text>
              <Text style={styles.verseLine2}>{k.line2_ta}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ))}
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
    paddingBottom: spacing.lg,
    backgroundColor: colors.screenGradientStart,
    zIndex: 10,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingRight: spacing.sm, gap: 4 },
  backBtnPressed: { opacity: 0.6 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: typography.semibold },
  headerContent: { flex: 1, flexDirection: 'row', alignItems: 'stretch', minWidth: 0 },
  headerAccentBar: { width: 4, borderRadius: 2, marginRight: spacing.md, height: 48 },
  headerTitleBlock: { flex: 1, justifyContent: 'center', minWidth: 0 },
  breadcrumb: { fontSize: typography.small, color: colors.textMuted, marginBottom: 2 },
  headerTitle: { fontSize: typography.h2, fontWeight: typography.extrabold, color: colors.textDark },
  headerTitleTa: { fontSize: typography.h3, color: colors.primary, marginTop: 2, fontWeight: typography.semibold },
  subtitleInline: { fontSize: typography.caption, color: colors.textMuted, marginTop: 4 },
  headerSpacer: { width: 72 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.screen, paddingTop: spacing.md },
  error: { color: colors.primary, marginBottom: spacing.sm },
  verseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderTint,
    ...shadows.card,
  },
  verseNumWrap: { width: 32, marginRight: spacing.md },
  verseNum: { fontSize: typography.caption, fontWeight: typography.bold, color: colors.primary },
  verseText: { flex: 1, minWidth: 0 },
  verseLine1: { fontSize: typography.small, color: colors.textDark },
  verseLine2: { fontSize: typography.small, color: colors.textBrown, marginTop: 2 },
});
