import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function ProfileScreen({ profile, onSignOut, onReportsPress }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.avatarWrap}>
        <Text style={styles.avatarText}>{(profile?.full_name || 'U').charAt(0)}</Text>
      </View>
      <Text style={styles.name}>{profile?.full_name || 'Learner'}</Text>
      <Text style={styles.email}>{profile?.email}</Text>
      <View style={styles.stats}>
        <Text style={styles.statLabel}>Daily goal</Text>
        <Text style={styles.statValue}>{profile?.daily_goal_minutes ?? 10} min</Text>
      </View>
      {onReportsPress ? (
        <TouchableOpacity style={styles.reportsBtn} onPress={onReportsPress}>
          <Text style={styles.reportsBtnText}>My Quiz Reports</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: colors.screenBg, alignItems: 'center', paddingTop: 48 },
  avatarWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.orange, opacity: 0.8, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: colors.textDark, marginTop: 16 },
  email: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  stats: { marginTop: 24, padding: 16, backgroundColor: '#fff', borderRadius: 16, minWidth: 160, alignItems: 'center' },
  statLabel: { fontSize: 11, color: colors.textMuted },
  statValue: { fontSize: 16, fontWeight: '700', color: colors.primary },
  reportsBtn: { marginTop: 24, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, backgroundColor: colors.cardBg, borderWidth: 1.5, borderColor: colors.border, minWidth: 200, alignItems: 'center' },
  reportsBtnText: { fontSize: typography.body, color: colors.textDark, fontWeight: '600' },
  signOutBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12, backgroundColor: 'rgba(192,57,43,0.12)' },
  signOutText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
});
