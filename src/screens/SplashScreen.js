import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

export default function SplashScreen({ navigation }) {
  return (
    <LinearGradient colors={[colors.splashBgStart, colors.splashBgEnd]} style={styles.container}>
      <View style={styles.kolam}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={[styles.dot, { opacity: 1 - i * 0.12 }]} />
        ))}
      </View>
      <View style={styles.watermark}>
        <Text style={styles.watermarkText}>த</Text>
      </View>
      <View style={styles.logoCircle}>
        <Text style={styles.logoLetter}>த</Text>
      </View>
      <Text style={styles.brandName}>Tamil Katpom</Text>
      <Text style={styles.brandTa}>தமிழ் கற்போம்</Text>
      <Text style={styles.tagline}>Learn Tamil. Speak Tamil. Live Tamil.</Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('SignUp')} activeOpacity={0.9}>
        <Text style={styles.primaryBtnText}>Get Started →</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login')} activeOpacity={0.9}>
        <Text style={styles.secondaryBtnText}>Sign In</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Over 50,000 Tamil learners worldwide</Text>
      <View style={styles.bottomDots}>
        <View style={[styles.bdot, styles.bdotActive]} />
        <View style={styles.bdot} />
        <View style={styles.bdot} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  kolam: { position: 'absolute', top: 52, flexDirection: 'row' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gold, marginHorizontal: 2 },
  watermark: { position: 'absolute', top: 80 },
  watermarkText: { fontSize: 120, color: '#fff', opacity: 0.06, fontWeight: '900' },
  logoCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoLetter: { fontSize: 68, color: colors.gold, fontWeight: '700' },
  brandName: { fontSize: 28, color: '#fff', fontWeight: '700', letterSpacing: 2 },
  brandTa: { fontSize: 15, color: colors.gold, letterSpacing: 3, marginTop: 6 },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 12 },
  primaryBtn: {
    marginTop: 48,
    width: '100%',
    maxWidth: 224,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { fontSize: 15, color: colors.primaryDark, fontWeight: '700' },
  secondaryBtn: {
    marginTop: 14,
    width: '100%',
    maxWidth: 224,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { fontSize: 15, color: '#fff', fontWeight: '500' },
  footer: { position: 'absolute', bottom: 70, fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  bottomDots: { position: 'absolute', bottom: 32, flexDirection: 'row', gap: 12 },
  bdot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  bdotActive: { backgroundColor: colors.gold, width: 7, height: 7, borderRadius: 3.5 },
});
