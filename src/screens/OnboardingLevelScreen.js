import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

const LEVELS = [
  { id: 'beginner', emoji: '🌱', title: 'Beginner', subtitle: 'I know little or nothing', hint: 'Start from அ ஆ இ alphabet →' },
  { id: 'intermediate', emoji: '🌿', title: 'Intermediate', subtitle: 'I know some words & phrases', hint: 'Jump to conversation practice →' },
  { id: 'advanced', emoji: '🌳', title: 'Advanced', subtitle: 'I can read & hold conversations', hint: 'Focus on grammar & writing →' },
  { id: 'heritage', emoji: '🏡', title: 'Heritage Learner', subtitle: 'Grew up hearing Tamil at home' },
];

export default function OnboardingLevelScreen({ onBack, onContinue }) {
  const [selected, setSelected] = useState('intermediate');

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.stepLabel}>Step 2 of 3</Text>
      <View style={styles.progressRow}>
        <View style={styles.progressBar} />
        <View style={[styles.progressBar, styles.progressActive]} />
        <View style={styles.progressBar} />
      </View>
      <Text style={styles.title}>What's your</Text>
      <Text style={[styles.title, styles.titleAccent]}>Tamil level?</Text>
      <Text style={styles.subtitle}>Be honest — we'll find your perfect start</Text>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {LEVELS.map((g) => {
          const isSelected = selected === g.id;
          return (
            <TouchableOpacity key={g.id} onPress={() => setSelected(g.id)} activeOpacity={0.9} style={styles.cardWrap}>
              {isSelected ? (
                <LinearGradient colors={[colors.navy, colors.navyDark]} style={styles.card}>
                  <View style={styles.emojiCircle}><Text style={styles.cardEmoji}>{g.emoji}</Text></View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitleWhite}>{g.title}</Text>
                    <Text style={styles.cardSubWhite}>{g.subtitle}</Text>
                    {g.hint ? <Text style={styles.cardHint}>{g.hint}</Text> : null}
                  </View>
                  <View style={styles.radioOuter}><View style={styles.radioInner} /></View>
                </LinearGradient>
              ) : (
                <View style={styles.cardPlain}>
                  <View style={styles.emojiCirclePlain}><Text style={styles.cardEmoji}>{g.emoji}</Text></View>
                  <View style={styles.cardText}>
                    <Text style={styles.cardTitle}>{g.title}</Text>
                    <Text style={styles.cardSub}>{g.subtitle}</Text>
                    {g.hint ? <Text style={styles.cardHintPlain}>{g.hint}</Text> : null}
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
  backBtn: { position: 'absolute', top: 56, left: 24, zIndex: 1 },
  backText: { fontSize: 20, color: colors.textBrown },
  stepLabel: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginBottom: 8 },
  progressRow: { flexDirection: 'row', gap: 8, marginBottom: 24, justifyContent: 'center' },
  progressBar: { width: 48, height: 5, borderRadius: 3, backgroundColor: colors.border },
  progressActive: { backgroundColor: colors.primary },
  title: { fontSize: 23, fontWeight: '700', color: colors.textDark },
  titleAccent: { color: colors.navy },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  scroll: { flex: 1, marginTop: 16 },
  scrollContent: { paddingBottom: 24 },
  cardWrap: { marginBottom: 10 },
  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, minHeight: 88 },
  cardPlain: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1.5, borderColor: colors.border, minHeight: 88 },
  emojiCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  emojiCirclePlain: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(232,139,26,0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardEmoji: { fontSize: 22 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  cardTitleWhite: { fontSize: 16, fontWeight: '700', color: '#fff' },
  cardSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  cardSubWhite: { fontSize: 11, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  cardHint: { fontSize: 10, color: colors.gold, marginTop: 2 },
  cardHintPlain: { fontSize: 10, color: colors.success, marginTop: 2 },
  radioOuter: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.navy },
  radioPlain: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.border },
  primaryBtn: { marginBottom: 32, height: 50, borderRadius: 25, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, color: '#fff', fontWeight: '700' },
});
