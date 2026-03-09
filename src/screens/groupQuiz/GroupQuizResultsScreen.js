import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { Button } from '../../components';
import * as groupQuizApi from '../../lib/groupQuizApi';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function GroupQuizResultsScreen({ navigation, route }) {
  const { roomId } = route.params ?? {};
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }
    groupQuizApi.getLeaderboard(roomId).then(({ leaderboard: lb, error: err }) => {
      setLeaderboard(lb || []);
      setError(err || '');
      setLoading(false);
    });
    groupQuizApi.completeRoom(roomId);
  }, [roomId]);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Group quiz results</Text>
      <Text style={styles.subtitle}>Top 3 are awarded</Text>
      {loading ? (
        <Text style={styles.loading}>Loading leaderboard…</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {leaderboard.length === 0 && error ? (
            <Text style={styles.error}>{error}</Text>
          ) : (
            leaderboard.map((p, i) => (
              <View key={p.userId} style={[styles.row, i < 3 && styles.rowTop]}>
                <Text style={styles.rank}>{i < 3 ? MEDAL[i] : `#${i + 1}`}</Text>
                <View style={styles.info}>
                  <Text style={styles.name}>{p.displayName}</Text>
                  <Text style={styles.score}>
                    {p.score}/{p.totalQuestions} correct
                    {p.timeTakenSeconds != null ? ` · ${p.timeTakenSeconds}s` : ''}
                  </Text>
                </View>
              </View>
            ))
          )}
          <Button
            title="Back to Practice"
            onPress={() => navigation.navigate('Tabs', { screen: 'Practice' })}
            style={styles.backBtn}
          />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg, padding: spacing.screen },
  title: { fontSize: typography.h1, fontWeight: '700', color: colors.textDark },
  subtitle: { fontSize: typography.body, color: colors.textMuted, marginTop: 4, marginBottom: spacing.lg },
  loading: { color: colors.textMuted },
  error: { color: colors.primary, marginBottom: spacing.md },
  scroll: { paddingBottom: spacing.xl },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowTop: { borderColor: colors.primary, backgroundColor: '#fff9f8' },
  rank: { fontSize: 28, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: typography.body, fontWeight: '600', color: colors.textDark },
  score: { fontSize: typography.small, color: colors.textMuted, marginTop: 2 },
  backBtn: { marginTop: spacing.xl },
});
