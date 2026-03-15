import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { Button, Confetti } from '../../components';
import { supabase } from '../../lib/supabase';
import { computeQuizPoints } from '../../constants/quizRewards';

export default function AathichudiQuizResultsScreen({ navigation, route }) {
  const { results = [], total = 0, timePerQuestion, verses = [], difficulty } = route.params ?? {};
  const correctCount = results.filter((r) => r.correct).length;
  const { points, breakdown } = computeQuizPoints(correctCount, total);
  const [awarded, setAwarded] = useState(false);
  const win = total > 0 && correctCount === total;

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || total <= 0 || awarded) return;
      setAwarded(true);
      await supabase.from('quiz_sessions').insert({
        user_id: user.id,
        questions_count: total,
        correct_count: correctCount,
        time_per_question_seconds: timePerQuestion ?? null,
        points_earned: points,
        quiz_type: 'aathichudi',
      });
      if (points > 0) {
        await supabase.rpc('add_profile_xp', { points });
      }
    })();
  }, [total, correctCount, points, timePerQuestion, awarded]);

  const answersScrollHeight = Math.min(Dimensions.get('window').height * 0.35, 280);

  return (
    <View style={styles.wrapper}>
      {win ? <Confetti /> : null}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.emoji}>{win ? '🎉' : '🎯'}</Text>
          <Text style={styles.title}>Quiz complete!</Text>
          <Text style={styles.subtitle}>ஆத்திசூடி · Aathichudi</Text>
          <Text style={styles.score}>
            {correctCount} / {total} correct
          </Text>
          <Text style={styles.percent}>
            {total ? Math.round((correctCount / total) * 100) : 0}%
          </Text>
          <View style={styles.rewardsBox}>
            <Text style={styles.rewardsLabel}>You earned</Text>
            <Text style={styles.rewardsValue}>{points} XP</Text>
            <Text style={styles.rewardsBreakdown}>{breakdown}</Text>
          </View>

          {verses.length > 0 ? (
            <View style={styles.answersSection}>
              <Text style={styles.answersTitle}>Verses</Text>
              <ScrollView
                style={[styles.answersList, { maxHeight: answersScrollHeight }]}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >
                {verses.slice(0, total).map((v, i) => {
                  const wasCorrect = results[i]?.correct;
                  const displayLine = v?.line_ta ? `${v.line_ta}${v.meaning_en ? ` — ${v.meaning_en}` : ''}` : '—';
                  return (
                    <View key={i} style={[styles.answerRow, !wasCorrect && styles.answerRowWrong]}>
                      <Text style={styles.answerNum}>{i + 1}.</Text>
                      <View style={styles.answerContent}>
                        <Text style={styles.answerWord} numberOfLines={2}>{displayLine}</Text>
                      </View>
                      {wasCorrect ? <Text style={styles.answerCheck}>✓</Text> : <Text style={styles.answerCross}>✕</Text>}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}
        </View>
        <View style={styles.actions}>
          <Button
            title="Try again"
            onPress={() => navigation.replace('AathichudiQuizSetup')}
            style={styles.btn}
          />
          <Button
            title="Invite friends to quiz"
            variant="outline"
            onPress={() => navigation.navigate('GroupQuizHome')}
            style={styles.btn}
          />
          <Button
            title="Back to Aathichudi"
            variant="outline"
            onPress={() => navigation.navigate('Tabs', { screen: 'Aathichudi' })}
            style={styles.btn}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  scrollContent: { padding: spacing.screen, paddingBottom: spacing.section * 2 },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.xxxl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: spacing.md },
  title: { fontSize: typography.h1, fontWeight: typography.bold, color: colors.textDark },
  subtitle: { fontSize: typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  score: { fontSize: typography.h2, color: colors.textBrown, marginTop: spacing.sm },
  percent: { fontSize: typography.hero, fontWeight: typography.bold, color: colors.primary, marginTop: spacing.xs },
  rewardsBox: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    width: '100%',
  },
  rewardsLabel: { fontSize: typography.small, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 },
  rewardsValue: { fontSize: typography.display, fontWeight: typography.bold, color: colors.gold, marginTop: spacing.xs },
  rewardsBreakdown: { fontSize: typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  answersSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    width: '100%',
    alignItems: 'flex-start',
  },
  answersTitle: {
    fontSize: typography.label,
    fontWeight: typography.bold,
    color: colors.textBrown,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  answersList: { width: '100%' },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  answerRowWrong: { backgroundColor: '#FFF5F5' },
  answerNum: { fontSize: typography.small, color: colors.textMuted, width: 24 },
  answerContent: { flex: 1 },
  answerWord: { fontSize: typography.body, color: colors.textDark, fontWeight: typography.semibold },
  answerCheck: { fontSize: 18, color: colors.success, fontWeight: '700' },
  answerCross: { fontSize: 18, color: '#C62828', fontWeight: '700' },
  actions: { gap: spacing.md },
  btn: { marginTop: spacing.xs },
});
