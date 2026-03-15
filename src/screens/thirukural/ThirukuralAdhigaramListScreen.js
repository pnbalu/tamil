import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  TextInput,
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
import { getAllAdhigarams, getSections } from '../../lib/thirukuralApi';

const PAD = spacing.screen;
const SECTION_COLORS = {
  1: { bg: colors.accentGreen, line: colors.accentForest },
  2: { bg: colors.orange, line: colors.primaryDark },
  3: { bg: colors.primary, line: colors.primaryDark },
};

function getKuralRange(adhigaramId) {
  const start = (adhigaramId - 1) * 10 + 1;
  const end = adhigaramId * 10;
  return { start, end };
}

export default function ThirukuralAdhigaramListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const [adhigarams, setAdhigarams] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState(null);

  useEffect(() => {
    Promise.all([
      getAllAdhigarams().then((r) => r.adhigarams || []),
      getSections().then((r) => r.sections || []),
    ]).then(([a, s]) => {
      setAdhigarams(a);
      setSections(s || []);
      setLoading(false);
    }).catch((e) => {
      setError(e?.message || 'Failed to load');
      setLoading(false);
    });
  }, []);

  const handleBack = () => navigation.goBack();

  const filteredAndGrouped = useMemo(() => {
    let list = adhigarams;
    const q = (searchQuery || '').trim().toLowerCase();
    if (q) {
      list = list.filter(
        (ad) =>
          (ad.name_en && ad.name_en.toLowerCase().includes(q)) ||
          (ad.name_ta && ad.name_ta.includes(searchQuery.trim()))
      );
    }
    if (selectedSectionId != null) {
      list = list.filter((ad) => ad.section_id === selectedSectionId);
    }
    const bySection = {};
    list.forEach((ad) => {
      const sid = ad.section_id;
      if (!bySection[sid]) bySection[sid] = [];
      bySection[sid].push(ad);
    });
    const sectionOrder = (sections.length ? sections.map((s) => s.id) : [1, 2, 3]).filter((id) => bySection[id]?.length);
    return sectionOrder.map((id) => ({ sectionId: id, adhigarams: bySection[id] || [] }));
  }, [adhigarams, sections, searchQuery, selectedSectionId]);

  if (loading) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <LinearGradient colors={screenGradientColors} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const sectionById = (id) => sections.find((s) => s.id === id) || { name_en: '', name_ta: '' };

  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={screenGradientColors} style={styles.screenGradient} />

      <View style={[styles.headerBar, { paddingTop: topMargin }]}>
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.mainTitle}>133 அதிகாரங்கள்</Text>
          <Text style={styles.subtitle}>All Chapters ∙ 1330 Kurals Total</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={20} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chapters..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          {sections.map((sec) => {
            const selected = selectedSectionId === sec.id;
            const scheme = SECTION_COLORS[sec.id] || SECTION_COLORS[1];
            return (
              <Pressable
                key={sec.id}
                style={[styles.filterChip, { backgroundColor: scheme.bg }, selected && styles.filterChipSelected]}
                onPress={() => setSelectedSectionId(selected ? null : sec.id)}
              >
                {selected ? <Ionicons name="checkmark" size={16} color="#fff" style={styles.filterCheck} /> : null}
                <Text style={styles.filterChipText} numberOfLines={1}>{sec.name_ta || sec.name_en}</Text>
              </Pressable>
            );
          })}
        </View>

        {filteredAndGrouped.map(({ sectionId, adhigarams: list }) => {
          const sec = sectionById(sectionId);
          const scheme = SECTION_COLORS[sectionId] || SECTION_COLORS[1];
          return (
            <View key={sectionId} style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View style={[styles.sectionHeaderLine, { backgroundColor: scheme.line }]} />
                <Text style={styles.sectionHeaderText} numberOfLines={1}>
                  — {sec.name_ta || sec.name_en} ∙ {(sec.name_en || '').toUpperCase()} —
                </Text>
                <View style={[styles.sectionHeaderLine, { backgroundColor: scheme.line }]} />
              </View>
              {list.map((ad) => {
                const range = getKuralRange(ad.id);
                return (
                  <TouchableOpacity
                    key={ad.id}
                    style={styles.chapterCard}
                    onPress={() => navigation.navigate('ThirukuralAdhigaram', { adhigaramId: ad.id, adhigaramName: ad.name_en, adhigaramNameTa: ad.name_ta })}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Chapter ${ad.id}, ${ad.name_ta || ad.name_en}. ${ad.name_en}. Kurals ${getKuralRange(ad.id).start} to ${getKuralRange(ad.id).end}. Tap to read verses.`}
                  >
                    <View style={[styles.chapterNum, { backgroundColor: scheme.bg }]}>
                      <Text style={styles.chapterNumText}>{ad.id}</Text>
                    </View>
                    <View style={styles.chapterText}>
                      <Text style={styles.chapterTa}>{ad.name_ta || ad.name_en}</Text>
                      <Text style={styles.chapterMeta}>
                        {ad.name_en} · Kurals {range.start}–{range.end}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                );
              })}
            </View>
          );
        })}
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
    paddingHorizontal: PAD,
    paddingBottom: spacing.md,
    backgroundColor: colors.screenGradientStart,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, paddingRight: spacing.sm, gap: 4 },
  backBtnPressed: { opacity: 0.6 },
  backText: { fontSize: 16, color: colors.primary, fontWeight: typography.semibold },
  headerCenter: { flex: 1, alignItems: 'center', minWidth: 0 },
  mainTitle: { fontSize: 22, fontWeight: typography.extrabold, color: colors.orange },
  subtitle: { fontSize: typography.caption, color: colors.textMuted, marginTop: 4 },
  headerSpacer: { width: 72 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: PAD, paddingTop: spacing.md },
  error: { color: colors.primary, marginBottom: spacing.sm },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.chipBg,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.chip,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.base,
    color: colors.textDark,
  },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  filterChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radii.md,
  },
  filterChipSelected: { opacity: 1 },
  filterCheck: { marginRight: 4 },
  filterChipText: { fontSize: typography.caption, fontWeight: typography.semibold, color: '#fff' },
  sectionBlock: { marginBottom: spacing.lg },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionHeaderLine: { flex: 1, height: 2, borderRadius: 1 },
  sectionHeaderText: {
    fontSize: typography.small,
    color: colors.textMuted,
    flexShrink: 0,
  },
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
  chapterNum: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  chapterNumText: { fontSize: typography.small, fontWeight: typography.bold, color: '#fff' },
  chapterText: { flex: 1, minWidth: 0 },
  chapterTa: { fontSize: typography.base, fontWeight: typography.semibold, color: colors.textDark },
  chapterMeta: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
});
