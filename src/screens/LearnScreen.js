import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

const CATEGORIES = [
  { id: 'alphabet', icon: '🔤', title: 'Alphabet', titleTa: 'அகராதி' },
  { id: 'numbers', icon: '🔢', title: 'Numbers', titleTa: 'எண்கள்' },
  { id: 'family', icon: '👨‍👩‍👧', title: 'Family', titleTa: 'குடும்பம்' },
  { id: 'food', icon: '🍛', title: 'Food', titleTa: 'உணவு' },
];

export default function LearnScreen({ onCategoryPress }) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Learn</Text>
      <Text style={styles.subtitle}>Choose a category to start</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c.id} style={styles.card} onPress={() => onCategoryPress?.(c)} activeOpacity={0.8}>
            <Text style={styles.cardIcon}>{c.icon}</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardTa}>{c.titleTa}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg },
  title: { fontSize: 24, fontWeight: '700', color: colors.textDark, paddingHorizontal: 24, paddingTop: 24 },
  subtitle: { fontSize: 12, color: colors.textMuted, paddingHorizontal: 24, marginTop: 4 },
  scroll: { padding: 24, paddingBottom: 100 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12, borderWidth: 1, borderColor: colors.border },
  cardIcon: { fontSize: 32, marginRight: 16 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  cardTa: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  arrow: { fontSize: 18, color: colors.primary },
});
