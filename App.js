import React, { useEffect, useState, useCallback } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { supabase } from './src/lib/supabase';

import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ForgotPasswordSuccessScreen from './src/screens/ForgotPasswordSuccessScreen';
import PhoneAuthScreen from './src/screens/PhoneAuthScreen';
import OnboardingGoalScreen from './src/screens/OnboardingGoalScreen';
import OnboardingLevelScreen from './src/screens/OnboardingLevelScreen';
import OnboardingDailyGoalScreen from './src/screens/OnboardingDailyGoalScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LearnScreen from './src/screens/LearnScreen';
import LessonDetailScreen from './src/screens/LessonDetailScreen';
import PlaceholderScreen from './src/screens/PlaceholderScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import QuizSetupScreen from './src/screens/QuizSetupScreen';
import QuizRunScreen from './src/screens/QuizRunScreen';
import QuizResultsScreen from './src/screens/QuizResultsScreen';
import QuizReportsScreen from './src/screens/QuizReportsScreen';
import { GroupQuizHomeScreen, GroupQuizCreateScreen, GroupQuizJoinScreen, GroupQuizLobbyScreen, GroupQuizResultsScreen } from './src/screens/groupQuiz';
import { CultureHomeScreen, CultureCategoryScreen, CultureDetailScreen, CultureQuizScreen } from './src/screens/culture';
import {
  ThirukuralHomeScreen,
  ThirukuralSectionScreen,
  ThirukuralAdhigaramListScreen,
  ThirukuralAdhigaramScreen,
  ThirukuralDetailScreen,
  ThirukuralPlayScreen,
} from './src/screens/thirukural';
import {
  AathichudiHomeScreen,
  AathichudiListScreen,
  AathichudiDetailScreen,
  AathichudiQuizSetupScreen,
  AathichudiPlayScreen,
  AathichudiQuizResultsScreen,
} from './src/screens/aathichudi';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ForgotPasswordSuccess" component={ForgotPasswordSuccessScreen} />
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
      <Stack.Screen name="OnboardingLevel" component={OnboardingLevelScreen} />
      <Stack.Screen name="OnboardingDailyGoal" component={OnboardingDailyGoalScreen} />
    </Stack.Navigator>
  );
}

function MainTabs({ profile, onRefreshProfile }) {
  useFocusEffect(
    useCallback(() => {
      onRefreshProfile?.();
    }, [onRefreshProfile])
  );
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#eee' },
        tabBarActiveTintColor: '#C0392B',
        tabBarInactiveTintColor: '#8B5E3C',
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" options={{ tabBarIcon: () => <Text>🏠</Text>, tabBarLabel: 'Home' }}>
        {({ navigation }) => (
          <DashboardScreen
            profile={profile}
            onLessonPress={(lesson) => navigation.getParent()?.navigate('LessonDetail', { lesson })}
          />
        )}
      </Tab.Screen>
      <Tab.Screen name="Learn" options={{ tabBarIcon: () => <Text>📚</Text>, tabBarLabel: 'Learn' }}>
        {({ navigation }) => (
          <LearnScreen onCategoryPress={(cat) => navigation.getParent()?.navigate('LessonDetail', { lesson: cat })} />
        )}
      </Tab.Screen>
      <Tab.Screen name="Practice" options={{ tabBarIcon: () => <Text>🎯</Text>, tabBarLabel: 'Practice' }}>
        {({ navigation }) => <PracticeScreen navigation={navigation} profile={profile} />}
      </Tab.Screen>
      <Tab.Screen name="Culture" options={{ tabBarIcon: () => <Text>🌸</Text>, tabBarLabel: 'Culture' }}>
        {({ navigation }) => <CultureHomeScreen navigation={navigation} profile={profile} />}
      </Tab.Screen>
      <Tab.Screen name="Thirukural" options={{ tabBarIcon: () => <Text>📜</Text>, tabBarLabel: 'Kural' }}>
        {({ navigation }) => <ThirukuralHomeScreen navigation={navigation} />}
      </Tab.Screen>
      <Tab.Screen name="Aathichudi" options={{ tabBarIcon: () => <Text>📖</Text>, tabBarLabel: 'Aathichudi' }}>
        {({ navigation }) => <AathichudiHomeScreen navigation={navigation} />}
      </Tab.Screen>
      <Tab.Screen name="Badges" options={{ tabBarIcon: () => <Text>🏆</Text>, tabBarLabel: 'Badges' }}>
        {() => <PlaceholderScreen title="Badges" emoji="🏆" />}
      </Tab.Screen>
      <Tab.Screen name="Profile" options={{ tabBarIcon: () => <Text>👤</Text>, tabBarLabel: 'Profile' }}>
        {({ navigation }) => (
          <ProfileScreen
            profile={profile}
            onSignOut={() => supabase.auth.signOut()}
            onReportsPress={() => navigation.getParent()?.navigate('QuizReports')}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

function MainStack({ profile, onRefreshProfile }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs">
        {() => <MainTabs profile={profile} onRefreshProfile={onRefreshProfile} />}
      </Stack.Screen>
      <Stack.Screen name="LessonDetail">
        {({ route, navigation }) => (
          <LessonDetailScreen
            lesson={route.params?.lesson}
            onBack={() => navigation.goBack()}
            onContinue={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="QuizSetup" component={QuizSetupScreen} />
      <Stack.Screen name="QuizRun" component={QuizRunScreen} />
      <Stack.Screen name="QuizResults" component={QuizResultsScreen} />
      <Stack.Screen name="QuizReports" component={QuizReportsScreen} />
      <Stack.Screen name="GroupQuizHome" component={GroupQuizHomeScreen} />
      <Stack.Screen name="GroupQuizCreate" component={GroupQuizCreateScreen} />
      <Stack.Screen name="GroupQuizJoin" component={GroupQuizJoinScreen} />
      <Stack.Screen name="GroupQuizLobby" component={GroupQuizLobbyScreen} />
      <Stack.Screen name="GroupQuizResults" component={GroupQuizResultsScreen} />
      <Stack.Screen name="CultureCategory" component={CultureCategoryScreen} />
      <Stack.Screen name="CultureDetail" component={CultureDetailScreen} />
      <Stack.Screen name="CultureQuiz" component={CultureQuizScreen} />
      <Stack.Screen name="ThirukuralSection" component={ThirukuralSectionScreen} />
      <Stack.Screen name="ThirukuralAdhigaramList" component={ThirukuralAdhigaramListScreen} />
      <Stack.Screen name="ThirukuralAdhigaram" component={ThirukuralAdhigaramScreen} />
      <Stack.Screen name="ThirukuralDetail" component={ThirukuralDetailScreen} />
      <Stack.Screen name="ThirukuralPlay" component={ThirukuralPlayScreen} />
      <Stack.Screen name="AathichudiList" component={AathichudiListScreen} />
      <Stack.Screen name="AathichudiDetail" component={AathichudiDetailScreen} />
      <Stack.Screen name="AathichudiQuizSetup" component={AathichudiQuizSetupScreen} />
      <Stack.Screen name="AathichudiPlay" component={AathichudiPlayScreen} />
      <Stack.Screen name="AathichudiQuizResults" component={AathichudiQuizResultsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingState, setOnboardingState] = useState({ goal: null, level: null });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setProfile(null);
    });
    return () => subscription?.unsubscribe();
  }, []);

  async function fetchProfile(uid) {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single();
    setProfile(data ?? null);
    setLoading(false);
  }

  async function updateProfile(updates) {
    if (!user) return;
    await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', user.id);
    setProfile((p) => ({ ...p, ...updates }));
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#C0392B" />
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <NavigationContainer>
          <AuthStack />
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  const needsOnboarding = profile && (profile.learning_goal == null || profile.learning_goal === '');

  if (needsOnboarding) {
    return (
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
            <Stack.Screen name="Onboarding">
              {() => (
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="Goal">
                    {({ navigation }) => (
                      <OnboardingGoalScreen
                        onContinue={(goal) => {
                          setOnboardingState((s) => ({ ...s, goal }));
                          navigation.navigate('Level');
                        }}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="Level">
                    {({ navigation }) => (
                      <OnboardingLevelScreen
                        onBack={() => navigation.goBack()}
                        onContinue={(level) => {
                          setOnboardingState((s) => ({ ...s, level }));
                          navigation.navigate('DailyGoal');
                        }}
                      />
                    )}
                  </Stack.Screen>
                  <Stack.Screen name="DailyGoal">
                    {({ navigation }) => (
                      <OnboardingDailyGoalScreen
                        onBack={() => navigation.goBack()}
                        onFinish={async (opts) => {
                          await updateProfile({
                            learning_goal: onboardingState.goal,
                            level: onboardingState.level,
                            daily_goal_minutes: opts.daily_goal_minutes,
                            reminder_enabled: opts.reminder_enabled,
                          });
                        }}
                      />
                    )}
                  </Stack.Screen>
                </Stack.Navigator>
              )}
            </Stack.Screen>
        </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <MainStack profile={profile} onRefreshProfile={() => user && fetchProfile(user.id)} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDF6EC' },
});
