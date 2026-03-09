import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform, Share, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { Button, ErrorText } from '../../components';
import { supabase } from '../../lib/supabase';
import * as groupQuizApi from '../../lib/groupQuizApi';

const QUESTION_COUNTS = [5, 10, 15, 20];
const TIME_OPTIONS = [{ value: 15, label: '15 sec' }, { value: 30, label: '30 sec' }, { value: 60, label: '1 min' }];
const DIRECTION_OPTIONS = [{ value: 'ta_to_en', label: 'Tamil to English' }, { value: 'en_to_ta', label: 'English to Tamil' }];

export default function GroupQuizCreateScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = useState(route.params?.userId);
  const level = route.params?.level ?? 'beginner';
  const [phase, setPhase] = useState('setup');
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [direction, setDirection] = useState('ta_to_en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [room, setRoom] = useState(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (userId) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.id) setUserId(user.id);
    });
  }, [userId]);

  const createRoom = async () => {
    const uid = userId || (await supabase.auth.getUser()).data?.user?.id;
    if (!uid) {
      setError('You must be signed in to create a room');
      Alert.alert('Sign in required', 'Please sign in to create a group quiz.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { room: r, code: c, error: err } = await groupQuizApi.createRoom({
        creatorId: uid,
        quizType: direction,
        level,
        questionsCount: questionCount,
        timePerQuestionSeconds: timePerQuestion,
      });
      if (err) {
        setError(err);
        Alert.alert('Could not create room', err);
        return;
      }
      setRoom(r);
      setCode(c || '');
      setPhase('invite');
    } catch (e) {
      const msg = e?.message || 'Failed to create room';
      setError(msg);
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const shareCode = () => {
    const message = 'Join my Tamil quiz! Use this code: ' + code;
    if (Platform.OS === 'web' || !Share?.share) {
      Alert.alert('Room code', message);
      return;
    }
    Share.share({ message, title: 'Quiz invite' }).catch(() => Alert.alert('Room code', message));
  };

  const goToLobby = async () => {
    if (!room?.id) return;
    const uid = userId || (await supabase.auth.getUser()).data?.user?.id;
    const count = room.questions_count ?? room.questionsCount ?? questionCount;
    navigation.replace('GroupQuizLobby', {
      roomId: room.id, isCreator: true, code, direction, timePerQuestion, level, questionsCount: count, userId: uid,
    });
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Tabs', { screen: 'Practice' });
    }
  };

  const topMargin = Math.max(insets.top, spacing.lg);
  const HeaderBar = () => (
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
  );

  if (phase === 'setup') {
    return (
      <View style={styles.wrapper}>
        <HeaderBar />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Create group quiz</Text>
          <Text style={styles.subtitle}>Friends join with a unique number. You start when everyone is in.</Text>
          <Text style={styles.label}>Quiz type</Text>
          <View style={styles.chipRow}>
            {DIRECTION_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.value} style={[styles.chip, direction === opt.value && styles.chipSelected]} onPress={() => setDirection(opt.value)}>
                <Text style={[styles.chipText, direction === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Number of questions</Text>
          <View style={styles.chipRow}>
            {QUESTION_COUNTS.map((n) => (
              <TouchableOpacity key={n} style={[styles.chip, questionCount === n && styles.chipSelected]} onPress={() => setQuestionCount(n)}>
                <Text style={[styles.chipText, questionCount === n && styles.chipTextSelected]}>{n}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Time per question</Text>
          <View style={styles.chipRow}>
            {TIME_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt.value} style={[styles.chip, timePerQuestion === opt.value && styles.chipSelected]} onPress={() => setTimePerQuestion(opt.value)}>
                <Text style={[styles.chipText, timePerQuestion === opt.value && styles.chipTextSelected]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.createSection}>
            {error ? <ErrorText message={error} /> : null}
            <Button title={loading ? 'Creating...' : 'Create room'} onPress={createRoom} disabled={loading} />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <HeaderBar />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Invite friends</Text>
        <Text style={styles.subtitle}>Share this number. When everyone has joined, go to the lobby and start.</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Room code</Text>
          <Text style={styles.codeValue} selectable>{code}</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={shareCode}><Text style={styles.shareBtnText}>Share code</Text></TouchableOpacity>
        {error ? <ErrorText message={error} /> : null}
        <Button title="Go to lobby" onPress={goToLobby} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  subtitle: { fontSize: typography.body, color: colors.textMuted, marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 22 },
  label: { fontSize: typography.small, fontWeight: '600', color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 12, paddingHorizontal: 18, borderRadius: radii.md, backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border },
  chipSelected: { borderColor: colors.primary, backgroundColor: '#fff5f2' },
  chipText: { fontSize: typography.body, color: colors.textDark },
  chipTextSelected: { color: colors.primary, fontWeight: '600' },
  createSection: { marginTop: spacing.section },
  codeBox: { backgroundColor: colors.cardBg, borderRadius: radii.lg, padding: spacing.xl, alignItems: 'center', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md },
  codeLabel: { fontSize: typography.small, color: colors.textMuted, marginBottom: 4 },
  codeValue: { fontSize: 32, fontWeight: '700', color: colors.primary, letterSpacing: 4 },
  shareBtn: { backgroundColor: colors.primary, padding: 14, borderRadius: radii.md, alignItems: 'center', marginBottom: spacing.lg },
  shareBtnText: { color: '#fff', fontWeight: '600', fontSize: typography.body },
});
