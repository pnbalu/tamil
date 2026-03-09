import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { getItemsByCategory } from '../../lib/cultureApi';

export default function CultureCategoryScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { categoryId, categoryName, level = 'beginner' } = route.params ?? {};
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!categoryId) return;
    getItemsByCategory(categoryId, level).then(({ items: list, error: err }) => {
      setItems(list || []);
      setError(err || '');
      setLoading(false);
    });
  }, [categoryId, level]);

  const topMargin = Math.max(insets.top, spacing.lg);

  const handleBack = () => {
    if (navigation.canGoBack()) navigation.goBack();
    else navigation.navigate('Tabs', { screen: 'Culture' });
  };

  if (loading) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.headerBar, { paddingTop: topMargin }]}>
        <Pressable style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]} onPress={handleBack} hitSlop={12}>
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{categoryName || 'Culture'}</Text>
        <Text style={styles.subtitle}>Choose a topic to read and test yourself</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate('CultureDetail', { itemId: item.id, itemName: item.name_en, level })}
            activeOpacity={0.85}
          >
            <View style={styles.cardIconWrap}>
              <Ionicons name="book-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{item.name_en}</Text>
              {item.name_ta ? <Text style={styles.cardTa}>{item.name_ta}</Text> : null}
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
  headerBar: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.screenBg, zIndex: 10, elevation: 10 },
  backBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingRight: spacing.md, gap: 2 },
  backBtnPressed: { opacity: 0.6 },
  backText: { fontSize: 17, color: colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 26, fontWeight: '700', color: colors.textDark },
  subtitle: { fontSize: typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.xxl, lineHeight: 22 },
  error: { color: colors.primary, marginBottom: spacing.md },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.cardBg, borderRadius: radii.lg, padding: spacing.xl, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff9f8', alignItems: 'center', justifyContent: 'center', marginRight: spacing.md, borderWidth: 1, borderColor: colors.primary },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '600', color: colors.textDark },
  cardTa: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
});
