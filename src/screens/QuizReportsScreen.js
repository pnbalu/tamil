import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors, spacing, typography } from '../theme';
import { radii } from '../theme/radii';
import { supabase } from '../lib/supabase';

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return `Today ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export default function QuizReportsScreen({ navigation }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setSessions([]);
          return;
        }
        const { data, error: e } = await supabase
          .from('quiz_sessions')
          .select('id, questions_count, correct_count, points_earned, completed_at, time_per_question_seconds')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false })
          .limit(100);
        if (e) throw e;
        setSessions(data ?? []);
      } catch (e) {
        setError(e?.message || 'Could not load reports');
        setSessions([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>My Quiz Reports</Text>
      <Text style={styles.subtitle}>Your quiz history and scores</Text>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No quiz reports yet</Text>
          <Text style={styles.emptyHint}>Complete a quiz to see your scores here.</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        >
          {sessions.map((s) => {
            const pct = s.questions_count > 0 ? Math.round((s.correct_count / s.questions_count) * 100) : 0;
            return (
              <View key={s.id} style={styles.row}>
                <View style={styles.rowLeft}>
                  <Text style={styles.rowDate}>{formatDate(s.completed_at)}</Text>
                  <Text style={styles.rowScore}>
                    {s.correct_count} / {s.questions_count} correct ({pct}%)
                  </Text>
                  {s.time_per_question_seconds != null && (
                    <Text style={styles.rowMeta}>{s.time_per_question_seconds}s per question</Text>
                  )}
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowXp}>+{s.points_earned ?? 0} XP</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  backBtn: { paddingHorizontal: spacing.screen, paddingTop: 56, paddingBottom: spacing.sm },
  backText: { fontSize: typography.title, color: colors.primary, fontWeight: typography.semibold },
  title: { fontSize: typography.h1, fontWeight: typography.bold, color: colors.textDark, paddingHorizontal: spacing.screen, marginBottom: spacing.xs },
  subtitle: { fontSize: typography.body, color: colors.textMuted, paddingHorizontal: spacing.screen, marginBottom: spacing.xl },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.screen },
  errorText: { fontSize: typography.body, color: colors.primary, textAlign: 'center' },
  emptyText: { fontSize: typography.h3, color: colors.textBrown, marginBottom: spacing.sm },
  emptyHint: { fontSize: typography.small, color: colors.textMuted },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.screen, paddingBottom: spacing.section },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: radii.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowLeft: { flex: 1 },
  rowDate: { fontSize: typography.body, fontWeight: typography.semibold, color: colors.textDark },
  rowScore: { fontSize: typography.small, color: colors.textBrown, marginTop: spacing.xxs },
  rowMeta: { fontSize: typography.caption, color: colors.textMuted, marginTop: 2 },
  rowRight: { marginLeft: spacing.md },
  rowXp: { fontSize: typography.title, fontWeight: typography.bold, color: colors.gold },
});
