import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { Button, ErrorText } from '../../components';
import * as groupQuizApi from '../../lib/groupQuizApi';

const POLL_INTERVAL_MS = 3000;

export default function GroupQuizLobbyScreen({ navigation, route }) {
  const { roomId, isCreator, code, direction, timePerQuestion, level, questionsCount, userId } = route.params ?? {};

  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  const load = async () => {
    if (!roomId) return;
    const [roomRes, partRes] = await Promise.all([
      groupQuizApi.getRoom(roomId),
      groupQuizApi.getParticipants(roomId),
    ]);
    setRoom(roomRes.room);
    setParticipants(partRes.participants || []);
    setError(roomRes.error || partRes.error || '');
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
    pollRef.current = setInterval(load, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [roomId]);

  useEffect(() => {
    if (!room || room.status !== 'in_progress') return;
    if (pollRef.current) clearInterval(pollRef.current);
    (async () => {
      const { questions, error: err } = await groupQuizApi.getQuestionsForRoom(roomId);
      if (err || !questions?.length) {
        setError(err || 'Questions not ready');
        return;
      }
      navigation.replace('QuizRun', {
        questions,
        timePerQuestion: timePerQuestion ?? 30,
        level: level ?? 'beginner',
        direction: direction ?? 'ta_to_en',
        roomId,
        isGroupQuiz: true,
        userId,
      });
    })();
  }, [room?.status]);

  const handleStart = async () => {
    if (!isCreator || !roomId) return;
    setError('');
    setStarting(true);
    try {
      const { ok, error: err } = await groupQuizApi.startRoom(roomId);
      if (!ok) {
        setError(err || 'Could not start quiz');
        return;
      }
      const { questions, error: qErr } = await groupQuizApi.getQuestionsForRoom(roomId);
      if (qErr || !questions?.length) {
        setError(qErr || 'Questions not ready');
        return;
      }
      navigation.replace('QuizRun', {
        questions,
        timePerQuestion: timePerQuestion ?? 30,
        level: level ?? 'beginner',
        direction: direction ?? 'ta_to_en',
        roomId,
        isGroupQuiz: true,
        userId,
      });
    } catch (e) {
      setError(e?.message || 'Failed to start');
    } finally {
      setStarting(false);
    }
  };

  if (loading && !room) {
    return (
      <View style={[styles.wrapper, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!room && !loading) {
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <ErrorText message="Room not found" />
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.title}>Waiting for players</Text>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>Code: {code}</Text>
        </View>
      </View>
      <Text style={styles.subtitle}>When everyone has joined, the host can start the quiz.</Text>

      <FlatList
        data={participants}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListHeaderComponent={<Text style={styles.listTitle}>Participants ({participants.length})</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No one else yet. Share the code!</Text>}
        renderItem={({ item }) => (
          <View style={styles.participantRow}>
            <Text style={styles.participantName}>{item.displayName}</Text>
            {item.user_id === userId ? <Text style={styles.youBadge}>You</Text> : null}
          </View>
        )}
      />
      {error ? <ErrorText message={error} /> : null}
      {isCreator ? (
        <Button
          title={starting ? 'Starting…' : 'Start quiz'}
          onPress={handleStart}
          disabled={starting || participants.length < 1}
        />
      ) : (
        <Text style={styles.waitingText}>Waiting for host to start…</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  centered: { justifyContent: 'center', alignItems: 'center' },
  backBtn: { padding: spacing.md, alignSelf: 'flex-start' },
  backText: { fontSize: 24, color: colors.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.screen, marginBottom: 4 },
  title: { fontSize: typography.h1, fontWeight: '700', color: colors.textDark },
  codeBadge: { backgroundColor: colors.cardBg, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border },
  codeText: { fontSize: typography.body, fontWeight: '600', color: colors.primary },
  subtitle: { fontSize: typography.body, color: colors.textMuted, paddingHorizontal: spacing.screen, marginBottom: spacing.lg },
  list: { paddingHorizontal: spacing.screen, paddingBottom: spacing.lg },
  listTitle: { fontSize: typography.small, fontWeight: '600', color: colors.textMuted, marginBottom: 8 },
  empty: { fontSize: typography.body, color: colors.textMuted, marginTop: 8 },
  participantRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
  participantName: { fontSize: typography.body, color: colors.textDark },
  youBadge: { fontSize: typography.small, color: colors.primary, fontWeight: '600' },
  waitingText: { textAlign: 'center', color: colors.textMuted, padding: spacing.lg },
});
