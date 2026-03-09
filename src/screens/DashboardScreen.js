import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

const LESSON_CARDS = [
  { id: 'alphabet', icon: '🔤', title: 'Alphabet', subtitle: 'அ ஆ இ ஈ…', progress: 3, total: 5, colorStart: '#1A3A5C', colorEnd: '#0D2440' },
  { id: 'numbers', icon: '🔢', title: 'Numbers', subtitle: 'ஒன்று — பத்து', progress: 1, total: 5, colorStart: '#1E5C38', colorEnd: '#0D3320' },
  { id: 'family', icon: '👨‍👩‍👧', title: 'Family', subtitle: 'அம்மா, அப்பா…', progress: 2, total: 5, colorStart: '#6A1A0A', colorEnd: '#C0392B' },
  { id: 'food', icon: '🍛', title: 'Food', subtitle: 'சோறு, தோசை…', progress: 0, total: 5, colorStart: '#7B3A00', colorEnd: '#E8731A' },
];

export default function DashboardScreen({ profile, onLessonPress }) {
  const [streak, setStreak] = useState(profile?.streak_days ?? 12);
  const [xp, setXp] = useState(profile?.total_xp ?? 580);
  const todayDone = 3;
  const todayTotal = 5;
  const progressPct = todayTotal ? Math.round((todayDone / todayTotal) * 100) : 0;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.vanakkam}>வணக்கம் 👋</Text>
        <Text style={styles.greeting}>{greeting()}, {profile?.full_name || 'Learner'}!</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={[styles.statValue, { color: colors.gold }]}>{xp}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </View>
        <LinearGradient colors={[colors.primary, colors.orange]} style={styles.todayCard}>
          <Text style={styles.todayLabel}>TODAY'S GOAL</Text>
          <Text style={styles.todayTitle}>Complete {todayTotal - todayDone} more lessons</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressText}>{todayDone} / {todayTotal} done · {progressPct}%</Text>
          <Text style={styles.targetEmoji}>🎯</Text>
        </LinearGradient>
        <Text style={styles.sectionTitle}>Continue Learning</Text>
        <View style={styles.cardsGrid}>
          {LESSON_CARDS.map((c) => (
            <TouchableOpacity key={c.id} style={styles.cardWrap} onPress={() => onLessonPress?.(c)} activeOpacity={0.9}>
              <LinearGradient colors={[c.colorStart, c.colorEnd]} style={styles.lessonCard}>
                <Text style={styles.cardIcon}>{c.icon}</Text>
                <Text style={styles.cardTitle}>{c.title}</Text>
                <Text style={styles.cardSub}>{c.subtitle}</Text>
                <View style={styles.cardProgressBg}>
                  <View style={[styles.cardProgressFill, { width: c.total ? `${(c.progress / c.total) * 100}%` : '0%' }]} />
                </View>
                <Text style={styles.cardProgressText}>
                  {c.progress > 0 ? `Lesson ${c.progress}/${c.total}` : 'Start now'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  vanakkam: { fontSize: 12, color: colors.textMuted, fontWeight: '500' },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.textDark, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14 },
  statEmoji: { fontSize: 20 },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.orange },
  statLabel: { fontSize: 10, color: colors.textMuted },
  todayCard: { marginTop: 16, borderRadius: 20, padding: 20, minHeight: 90 },
  todayLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '600', letterSpacing: 1 },
  todayTitle: { fontSize: 17, color: '#fff', fontWeight: '700', marginTop: 4 },
  progressBarBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 10, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 4 },
  progressText: { fontSize: 10, color: colors.gold, marginTop: 4 },
  targetEmoji: { position: 'absolute', right: 20, top: 20, fontSize: 30 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textBrown, marginTop: 24 },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 12 },
  cardWrap: { width: '47%' },
  lessonCard: { borderRadius: 18, padding: 16, minHeight: 120 },
  cardIcon: { fontSize: 24 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginTop: 4 },
  cardSub: { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  cardProgressBg: { height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginTop: 8, overflow: 'hidden' },
  cardProgressFill: { height: '100%', borderRadius: 3 },
  cardProgressText: { fontSize: 10, marginTop: 4 },
});
