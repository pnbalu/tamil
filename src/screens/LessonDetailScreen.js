import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const TOPICS = [
  { char: 'அ', title: 'Short-a vowel', sub: 'As in "apple" · 3 examples', done: true },
  { char: 'ஆ', title: 'Long-aa vowel', sub: 'As in "father" · 3 examples', current: true },
  { char: 'இ', title: 'Short-i vowel', sub: 'Locked — complete ஆ first', locked: true },
  { char: 'ஈ', title: 'Long-ii vowel', sub: 'Locked', locked: true },
];

export default function LessonDetailScreen({ lesson, onBack, onContinue }) {
  const progress = 40;
  return (
    <View style={styles.wrapper}>
      <LinearGradient colors={[colors.navy, colors.navyDark]} style={styles.topBand}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>📚 Alphabet</Text>
        </View>
        <Text style={styles.lessonTitle}>Lesson 3: Vowels</Text>
        <Text style={styles.lessonTa}>உயிர் எழுத்துகள்</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}><Text style={styles.metaText}>⏱ 8 min</Text></View>
          <View style={styles.metaPill}><Text style={styles.metaText}>🔤 12 chars</Text></View>
          <View style={styles.metaPill}><Text style={styles.metaText}>+20 XP</Text></View>
        </View>
      </LinearGradient>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.progressLabel}>Your progress</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressPct}>{progress}%</Text>
        </View>
        <Text style={styles.inThisLesson}>In this lesson</Text>
        {TOPICS.map((t, i) => (
          <View key={i} style={[styles.topicRow, t.locked && styles.topicLocked]}>
            <View style={[styles.charCircle, t.locked && styles.charCircleLocked]}>
              <Text style={[styles.charText, t.locked && styles.charTextLocked]}>{t.char}</Text>
            </View>
            <View style={styles.topicText}>
              <Text style={[styles.topicTitle, t.locked && styles.topicTitleLocked]}>{t.title}</Text>
              <Text style={[styles.topicSub, t.locked && styles.topicSubLocked]}>{t.sub}</Text>
            </View>
            {t.done ? <Text style={styles.doneMark}>✓</Text> : t.current ? <Text style={styles.playMark}>▶</Text> : t.locked ? <Text>🔒</Text> : null}
          </View>
        ))}
        <View style={styles.xpCard}>
          <Text style={styles.xpEmoji}>🎁</Text>
          <View>
            <Text style={styles.xpTitle}>Complete all 5 parts → Earn 20 XP + 🏅</Text>
            <Text style={styles.xpSub}>Vowels Mastery badge unlocked!</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
          <Text style={styles.continueBtnText}>Continue Lesson →</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  topBand: { paddingTop: 56, paddingHorizontal: 24, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backBtn: { position: 'absolute', top: 56, left: 24 },
  backText: { fontSize: 20, color: '#fff' },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 11 },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  lessonTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginTop: 12 },
  lessonTa: { fontSize: 14, color: colors.gold, marginTop: 4 },
  metaRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  metaPill: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 11 },
  metaText: { fontSize: 10, color: '#fff' },
  scroll: { padding: 24, paddingBottom: 40 },
  progressLabel: { fontSize: 11, fontWeight: '600', color: colors.textBrown },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  progressBarBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.border, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.navy, borderRadius: 4 },
  progressPct: { fontSize: 10, color: colors.navy, marginLeft: 8 },
  inThisLesson: { fontSize: 13, fontWeight: '700', color: colors.textBrown, marginTop: 24 },
  topicRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 10 },
  topicLocked: { opacity: 0.6 },
  charCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  charCircleLocked: { backgroundColor: colors.border },
  charText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  charTextLocked: { color: colors.textMuted },
  topicText: { flex: 1 },
  topicTitle: { fontSize: 15, fontWeight: '600', color: colors.textDark },
  topicTitleLocked: { color: colors.textMuted },
  topicSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  topicSubLocked: { color: '#aaa' },
  doneMark: { fontSize: 11, color: colors.success },
  playMark: { fontSize: 10, color: colors.orange },
  xpCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(232,139,26,0.12)', borderRadius: 16, padding: 16, marginTop: 24 },
  xpEmoji: { fontSize: 18, marginRight: 12 },
  xpTitle: { fontSize: 12, fontWeight: '600', color: colors.textBrown },
  xpSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  continueBtn: { marginTop: 24, height: 44, borderRadius: 22, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  continueBtnText: { fontSize: 14, color: '#fff', fontWeight: '600' },
});
