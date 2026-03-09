import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const GOALS = [
  { id: 'heritage', emoji: '🏠', title: 'Heritage & Roots', subtitle: 'Connect with my Tamil culture & family' },
  { id: 'travel', emoji: '✈️', title: 'Travel & Culture', subtitle: 'Visiting Tamil Nadu or Sri Lanka' },
  { id: 'work', emoji: '💼', title: 'Work & Business', subtitle: 'Communicate with Tamil colleagues' },
  { id: 'fun', emoji: '🎵', title: 'Movies & Music', subtitle: 'Enjoy Tamil cinema & songs' },
];

export default function OnboardingGoalScreen({ onContinue }) {
  const [selected, setSelected] = useState('heritage');

  return (
    <View style={styles.wrapper}>
      <Text style={styles.stepLabel}>Step 1 of 3</Text>
      <View style={styles.progressRow}>
        <View style={[styles.progressBar, styles.progressActive]} />
        <View style={styles.progressBar} />
        <View style={styles.progressBar} />
      </View>
      <Text style={styles.title}>Why are you</Text>
      <Text style={[styles.title, styles.titleAccent]}>learning Tamil?</Text>
      <Text style={styles.subtitle}>We'll personalise your learning path</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {GOALS.map((g) => {
          const isSelected = selected === g.id;
          return (
            <TouchableOpacity key={g.id} onPress={() => setSelected(g.id)} activeOpacity={0.9} style={styles.cardWrap}>
              {isSelected ? (
                <LinearGradient colors={[colors.primary, colors.orange]} style={styles.card}>
                  <Text style={styles.cardEmoji}>{g.emoji}</Text>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitleWhite}>{g.title}</Text>
                    <Text style={styles.cardSubWhite}>{g.subtitle}</Text>
                  </View>
                  <View style={styles.radioOuter}><View style={styles.radioInner} /></View>
                </LinearGradient>
              ) : (
                <View style={styles.cardPlain}>
                  <Text style={styles.cardEmoji}>{g.emoji}</Text>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{g.title}</Text>
                    <Text style={styles.cardSub}>{g.subtitle}</Text>
                  </View>
                  <View style={styles.radioPlain} />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <TouchableOpacity style={styles.primaryBtn} onPress={() => onContinue?.(selected)}>
        <Text style={styles.primaryBtnText}>Continue →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg, paddingHorizontal: 24, paddingTop: 56 },
  stepLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 8 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 24, justifyContent: 'center' },
  progressBar: { width: 48, height: 5, borderRadius: 3, backgroundColor: colors.border },
  progressActive: { backgroundColor: colors.primary },
  title: { fontSize: 23, fontWeight: '700', color: colors.textDark },
  titleAccent: { color: colors.primary },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  scroll: { flex: 1, marginTop: 16 },
  scrollContent: { paddingBottom: 24 },
  cardWrap: { marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, minHeight: 76 },
  cardPlain: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border, minHeight: 76 },
  cardEmoji: { fontSize: 28, marginRight: 12 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  cardTitleWhite: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cardSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  cardSubWhite: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  radioOuter: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.primary },
  radioPlain: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border },
  primaryBtn: { marginBottom: 32, height: 50, borderRadius: 25, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});
