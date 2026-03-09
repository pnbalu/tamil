import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme';

export default function ForgotPasswordSuccessScreen({ navigation }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>✅</Text>
      </View>
      <Text style={styles.title}>Password Reset!</Text>
      <Text style={styles.subtitle}>Your password has been updated successfully. You're all set!</Text>
      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('Login')}>
        <Text style={styles.primaryBtnText}>Back to Sign In →</Text>
      </TouchableOpacity>
      <Text style={styles.tamil}>வணக்கம்! Ready to learn? 🎉</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#0D2A14', alignItems: 'center', justifyContent: 'center', padding: 24 },
  iconWrap: { marginBottom: 24 },
  icon: { fontSize: 72 },
  title: { fontSize: 26, fontWeight: '700', color: colors.gold, marginBottom: 12 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginBottom: 32 },
  primaryBtn: { height: 52, paddingHorizontal: 48, borderRadius: 26, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  primaryBtnText: { fontSize: 15, color: colors.primaryDark, fontWeight: '700' },
  tamil: { marginTop: 24, fontSize: 14, color: colors.success, opacity: 0.8 },
});
