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
import { getAdhigarams } from '../../lib/thirukuralApi';

export default function ThirukuralSectionScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const { sectionId, sectionName, sectionNameTa } = route.params ?? {};
  const [adhigarams, setAdhigarams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sectionId) return;
    getAdhigarams(sectionId).then(({ adhigarams: a, error: e }) => {
      setAdhigarams(a || []);
      setError(e || null);
      setLoading(false);
    });
  }, [sectionId]);

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
            <Text style={styles.headerTitle} numberOfLines={1}>{sectionName || 'Section'}</Text>
            {sectionNameTa ? <Text style={styles.headerTitleTa} numberOfLines={1}>{sectionNameTa}</Text> : null}
            <Text style={styles.subtitleInline}>{adhigarams.length} chapters · Tap to read verses</Text>
          </View>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {adhigarams.map((ad) => (
          <TouchableOpacity
            key={ad.id}
            style={styles.chapterCard}
            onPress={() => navigation.getParent()?.navigate('ThirukuralAdhigaram', { adhigaramId: ad.id, adhigaramName: ad.name_en, adhigaramNameTa: ad.name_ta })}
            activeOpacity={0.85}
          >
            <View style={styles.chapterNum}>
              <Text style={styles.chapterNumText}>{ad.id}</Text>
            </View>
            <View style={styles.chapterText}>
              <Text style={styles.chapterEn}>{ad.name_en}</Text>
              {ad.name_ta ? <Text style={styles.chapterTa}>{ad.name_ta}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
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
  chapterCard: {
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
  chapterNum: { width: 36, height: 36, borderRadius: radii.md, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  chapterNumText: { fontSize: typography.small, fontWeight: typography.bold, color: '#fff' },
  chapterText: { flex: 1, minWidth: 0 },
  chapterEn: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textDark },
  chapterTa: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
});
