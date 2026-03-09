import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { colors } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const GOALS = [
  { id: 'casual', emoji: '🚶', title: 'Casual', mins: 5 },
  { id: 'regular', emoji: '🏃', title: 'Regular', mins: 10 },
  { id: 'serious', emoji: '💪', title: 'Serious', mins: 20 },
  { id: 'intense', emoji: '🔥', title: 'Intense', mins: 30 },
];

export default function OnboardingDailyGoalScreen({ onBack, onFinish }) {
  const [selected, setSelected] = useState('regular');
  const [reminder, setReminder] = useState(true);

  const handleFinish = () => {
    const mins = GOALS.find((g) => g.id === selected)?.mins ?? 10;
    onFinish?.({ daily_goal_minutes: mins, reminder_enabled: reminder });
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.stepLabel}>Step 3 of 3</Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
        <View style={[styles.progressBar, styles.progressActive]} />
      </View>
      <Text style={styles.title}>Set your</Text>
      <Text style={[styles.title, styles.titleAccent]}>daily goal</Text>
      <Text style={styles.subtitle}>Even 5 minutes a day builds a habit!</Text>
      <View style={styles.grid}>
        {GOALS.map((g) => {
          const isSelected = selected === g.id;
          return (
            <TouchableOpacity key={g.id} onPress={() => setSelected(g.id)} style={styles.gridItem} activeOpacity={0.9}>
              {isSelected ? (
                <LinearGradient colors={[colors.success, '#1E5C38']} style={styles.goalCard}>
                  <Text style={styles.goalEmoji}>{g.emoji}</Text>
                  <Text style={styles.goalTitleWhite}>{g.title}</Text>
                  <Text style={styles.goalMinsWhite}>{g.mins} min/day</Text>
                  <View style={styles.dotOuter}><View style={styles.dotInner} /></View>
                </LinearGradient>
              ) : (
                <View style={styles.goalCardPlain}>
                  <Text style={styles.goalEmoji}>{g.emoji}</Text>
                  <Text style={styles.goalTitle}>{g.title}</Text>
                  <Text style={styles.goalMins}>{g.mins} min/day</Text>
                  <View style={styles.dotPlain} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.reminderRow}>
        <View>
          <Text style={styles.reminderTitle}>Daily Reminder 🔔</Text>
          <Text style={styles.reminderSub}>We'll remind you at 8:00 AM</Text>
        </View>
        <Switch value={reminder} onValueChange={setReminder} trackColor={{ false: colors.border, true: colors.success }} thumbColor="#fff" />
      </View>
      <TouchableOpacity style={styles.primaryBtn} onPress={handleFinish}>
        <Text style={styles.primaryBtnText}>Start Learning! 🎉</Text>
      </TouchableOpacity>
      <Text style={styles.hint}>You can change this anytime in Settings</Text>
      <Text style={styles.tamil}>கற்றல் தொடங்குவோம்! Let's begin!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg, paddingHorizontal: 24, paddingTop: 56 },
  backBtn: { position: 'absolute', top: 56, left: 24, zIndex: 1 },
  backText: { fontSize: 20, color: colors.textBrown },
  stepLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 8 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 24, justifyContent: 'center' },
  progressBar: { width: 48, height: 5, borderRadius: 3, backgroundColor: colors.border },
  progressActive: { backgroundColor: colors.primary },
  title: { fontSize: 23, fontWeight: '700', color: colors.textDark },
  titleAccent: { color: colors.success },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 16, gap: 12 },
  gridItem: { width: '47%' },
  goalCard: { borderRadius: 18, padding: 16, minHeight: 110, alignItems: 'center', justifyContent: 'center' },
  goalCardPlain: { borderRadius: 18, padding: 16, minHeight: 110, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border },
  goalEmoji: { fontSize: 32, marginBottom: 8 },
  goalTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  goalTitleWhite: { fontSize: 16, fontWeight: '700', color: '#fff' },
  goalMins: { fontSize: 12, color: colors.textMuted },
  goalMinsWhite: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  dotOuter: { position: 'absolute', bottom: 12, width: 16, height: 16, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  dotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success },
  dotPlain: { position: 'absolute', bottom: 12, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.border },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 24 },
  reminderTitle: { fontSize: 13, fontWeight: '600', color: colors.textDark },
  reminderSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  primaryBtn: { marginTop: 24, height: 52, borderRadius: 26, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },
  hint: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: 12 },
  tamil: { fontSize: 13, color: colors.success, textAlign: 'center', marginTop: 8, opacity: 0.8 },
});
