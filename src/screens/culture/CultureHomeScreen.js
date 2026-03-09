import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { getCategories } from '../../lib/cultureApi';

export default function CultureHomeScreen({ navigation, profile }) {
  const insets = useSafeAreaInsets();
  const level = profile?.level || 'beginner';
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(({ categories: list, error: err }) => {
      setCategories(list || []);
      setError(err || '');
      setLoading(false);
    });
  }, []);

  const topPadding = Math.max(insets.top, spacing.lg);

  if (loading) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Culture</Text>
        <Text style={styles.subtitle}>Explore Tamil culture and test your vocabulary</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={styles.card}
            onPress={() => navigation.getParent()?.navigate('CultureCategory', { categoryId: cat.id, categoryName: cat.name_en, level })}
            activeOpacity={0.85}
          >
            <View style={styles.cardIconWrap}>
              <Ionicons name="flower-outline" size={32} color={colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{cat.name_en}</Text>
              {cat.name_ta ? <Text style={styles.cardTa}>{cat.name_ta}</Text> : null}
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.primary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingBottom: spacing.xxl },
  title: { fontSize: 26, fontWeight: '700', color: colors.textDark },
  subtitle: { fontSize: typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xxl, lineHeight: 22 },
  error: { color: colors.primary, marginBottom: spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff9f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cardText: { flex: 1 },
  cardTitle: { fontSize: typography.h2, fontWeight: '600', color: colors.textDark },
  cardTa: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
});
