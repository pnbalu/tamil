import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { supabase } from '../../lib/supabase';

export default function GroupQuizHomeScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState(route.params?.userId);
  const level = route.params?.level ?? 'beginner';

  useEffect(() => {
    if (userId) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) setUserId(user.id);
    });
  }, [userId]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Tabs', { screen: 'Practice' });
    }
  };

  const topMargin = Math.max(insets.top, spacing.lg);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.headerBar, { paddingTop: topMargin }]} pointerEvents="box-none">
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
          onPress={handleBack}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color={colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Group quiz</Text>
        <Text style={styles.subtitle}>Create a room and share the code, or join with a code from a friend.</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('GroupQuizCreate', { userId: userId || undefined, level })}
          activeOpacity={0.85}
        >
          <View style={styles.cardIconWrap}>
            <Ionicons name="add-circle-outline" size={36} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Create quiz</Text>
          <Text style={styles.cardDesc}>Get a unique number. Add friends by phone or call and share the number.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('GroupQuizJoin', { userId: userId || undefined })}
          activeOpacity={0.85}
        >
          <View style={styles.cardIconWrap}>
            <Ionicons name="keypad-outline" size={36} color={colors.primary} />
          </View>
          <Text style={styles.cardTitle}>Join quiz</Text>
          <Text style={styles.cardDesc}>Enter the 6-digit code your friend gave you.</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  headerBar: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.screenBg,
    zIndex: 10,
    elevation: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    gap: 2,
  },
  backBtnPressed: { opacity: 0.6 },
  backText: { fontSize: 17, color: colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.screen, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 26, fontWeight: '700', color: colors.textDark },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff9f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  cardTitle: { fontSize: typography.h2, fontWeight: '600', color: colors.textDark },
  cardDesc: { fontSize: typography.small, color: colors.textMuted, marginTop: spacing.xs, lineHeight: 20 },
});
