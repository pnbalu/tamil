import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '../../theme';
import { radii } from '../../theme/radii';
import { ErrorText } from '../../components';
import * as groupQuizApi from '../../lib/groupQuizApi';

const CODE_LENGTH = 6;

export default function GroupQuizJoinScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const codeInputRef = useRef(null);
  const userId = route.params?.userId;
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Tabs', { screen: 'Practice' });
    }
  };

  const handleJoin = async () => {
    if (!userId) {
      setError('You must be signed in to join');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { room, error: err } = await groupQuizApi.joinRoom(code, userId);
      if (err && !room) {
        setError(err);
        return;
      }
      if (room) {
        navigation.replace('GroupQuizLobby', {
          roomId: room.id,
          isCreator: false,
          code: room.code,
          direction: room.quiz_type,
          timePerQuestion: room.time_per_question_seconds,
          level: room.level,
          questionsCount: room.questions_count ?? room.questionsCount,
          userId,
        });
      }
    } catch (e) {
      setError(e?.message || 'Could not join');
    } finally {
      setLoading(false);
    }
  };

  const digits = code.replace(/\D/g, '').slice(0, CODE_LENGTH).padEnd(CODE_LENGTH, '');
  const canJoin = code.replace(/\D/g, '').length >= CODE_LENGTH && !loading;

  const topMargin = Math.max(insets.top, spacing.lg);

  return (
    <KeyboardAvoidingView style={styles.wrapper} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="keypad-outline" size={36} color={colors.primary} />
          </View>
          <Text style={styles.title}>Join group quiz</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code your friend shared with you</Text>
        </View>

        <Pressable
          style={styles.inputCard}
          onPress={() => codeInputRef.current?.focus()}
        >
          <View style={styles.digitRow} pointerEvents="none">
            {Array.from({ length: CODE_LENGTH }).map((_, i) => (
              <View key={i} style={[styles.digitBox, code.length > i && styles.digitBoxFilled]}>
                <Text style={styles.digitText}>{digits[i] || ''}</Text>
              </View>
            ))}
          </View>
          <TextInput
            ref={codeInputRef}
            style={styles.hiddenInput}
            placeholder=""
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, CODE_LENGTH))}
            keyboardType="number-pad"
            maxLength={CODE_LENGTH}
            selectTextOnFocus
            accessibilityLabel="Room code"
            caretHidden
          />
          <Text style={styles.codeHint} pointerEvents="none">Tap here to enter code</Text>
        </Pressable>

        {error ? <ErrorText message={error} /> : null}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.joinBtn, (!canJoin && styles.joinBtnDisabled)]}
            onPress={handleJoin}
            disabled={!canJoin}
            activeOpacity={0.85}
          >
            <Text style={[styles.joinBtnText, !canJoin && styles.joinBtnTextDisabled]}>
              {loading ? 'Joining…' : 'Join quiz'}
            </Text>
          </TouchableOpacity>
        </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: spacing.screen,
    paddingTop: spacing.lg,
    justifyContent: 'center',
    minHeight: 400,
  },
  header: { alignItems: 'center', marginBottom: spacing.xxl },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff9f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.textDark, textAlign: 'center' },
  subtitle: {
    fontSize: typography.body,
    color: colors.textMuted,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputCard: {
    backgroundColor: colors.cardBg,
    borderRadius: radii.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    position: 'relative',
  },
  digitRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.md },
  digitBox: {
    width: 44,
    height: 52,
    borderRadius: radii.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.screenBg,
  },
  digitBoxFilled: { borderColor: colors.primary, backgroundColor: '#fff9f8' },
  digitText: { fontSize: 24, fontWeight: '700', color: colors.textDark },
  hiddenInput: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
    opacity: 0.01,
    fontSize: 16,
    color: colors.textDark,
  },
  codeHint: { fontSize: typography.small, color: colors.textMuted },
  actions: { marginTop: spacing.lg },
  joinBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBtnDisabled: { backgroundColor: colors.border, opacity: 0.9 },
  joinBtnText: { fontSize: 18, fontWeight: '700', color: colors.textOnPrimary },
  joinBtnTextDisabled: { color: colors.textMuted },
});
