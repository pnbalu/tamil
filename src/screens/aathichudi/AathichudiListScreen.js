import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import { getAllVerses } from '../../lib/aathichudiApi';

export default function AathichudiListScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const topMargin = Math.max(insets.top, 16);
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllVerses()
      .then(({ verses: v, error: e }) => {
        setVerses(v || []);
        setError(e || null);
        setLoading(false);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load');
        setLoading(false);
      });
  }, []);

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
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.titleTa}>109 வரிகள்</Text>
          <Text style={styles.subtitle}>All Aathichudi Verses — Alphabetical Order</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {error ? (
        <View style={styles.errorWrap}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={verses}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [styles.verseCard, pressed && styles.verseCardPressed]}
                onPress={() => navigation.navigate('AathichudiDetail', { verseId: item.id })}
                accessibilityRole="button"
                accessibilityLabel={`Verse ${item.id}: ${item.line_ta}`}
              >
                <View style={styles.verseNum}>
                  <Text style={styles.verseNumText}>{item.id}</Text>
                </View>
                <View style={styles.verseTextWrap}>
                  <Text style={styles.verseLine} numberOfLines={2}>{item.line_ta}</Text>
                  {item.meaning_en ? <Text style={styles.verseMeaning} numberOfLines={1}>{item.meaning_en}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
            )}
          />
        </>
      )}
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
  backBtn: { padding: spacing.xs },
  backBtnPressed: { opacity: 0.7 },
  backText: { fontSize: typography.base, color: colors.primary, fontWeight: typography.semibold },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerSpacer: { width: 60 },
  titleTa: { fontSize: typography.lg, fontWeight: typography.bold, color: colors.textDark },
  subtitle: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  errorWrap: { padding: spacing.lg },
  error: { color: colors.primary },
  listContent: { padding: spacing.md, paddingBottom: 100 },
  verseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderTint,
    ...shadows.cardSmall,
  },
  verseCardPressed: { opacity: 0.9 },
  verseNum: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  verseNumText: { fontSize: typography.small, fontWeight: typography.bold, color: colors.textOnPrimary },
  verseTextWrap: { flex: 1 },
  verseLine: { fontSize: typography.base, color: colors.textDark, lineHeight: 22 },
  verseMeaning: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
});
