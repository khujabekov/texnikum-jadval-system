import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { storageService } from './src/services/storageService';
import { Group } from './src/types';
import { StudentLoginScreen } from './src/screens/auth/StudentLoginScreen';
import { StudentHomeScreen } from './src/screens/student/StudentHomeScreen';

type AppRoute = 'student_login' | 'student_home';

function MainApp() {
  const { colors, mode } = useTheme();
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('student_login');
  const [loggedInGroup, setLoggedInGroup] = useState<Group | null>(null);
  const [studentJshshir, setStudentJshshir] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Check saved session on app mount
  const checkInitialSession = useCallback(async () => {
    try {
      await storageService.init();

      // Check if student session is active
      const studentSession = await storageService.getStudentSession();
      if (studentSession && studentSession.group && studentSession.jshshir) {
        // Cross-check if the group still exists in repository
        const allGroups = await storageService.getGroups();
        const existingGroup = allGroups.find((g) => g.id === studentSession.group.id);

        if (!existingGroup) {
          // Group was deleted by admin — clean up session and notify student
          await storageService.clearSession();
          Alert.alert(
            'Guruh topilmadi',
            'Siz biriktirilgan guruh ma\'muriyat tomonidan o\'chirilgan yoki yangilangan. Iltimos, qaytadan tizimga kiring.'
          );
          setCurrentRoute('student_login');
          setIsInitializing(false);
          return;
        }

        // Keep group object updated to latest state (e.g. if name was edited)
        setLoggedInGroup(existingGroup);
        setStudentJshshir(studentSession.jshshir);
        setCurrentRoute('student_home');
        setIsInitializing(false);
        return;
      }

      setCurrentRoute('student_login');
    } catch (e) {
      console.error('[App] Init session error', e);
      setCurrentRoute('student_login');
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    checkInitialSession();
  }, [checkInitialSession]);

  // Real-time student deletion detection & graceful auto-logout
  useEffect(() => {
    if (currentRoute !== 'student_home' || !studentJshshir) return;

    const unsubscribe = storageService.subscribeToStudentStatus(studentJshshir, async () => {
      await storageService.clearSession();
      setLoggedInGroup(null);
      setStudentJshshir('');
      setCurrentRoute('student_login');
      Alert.alert(
        'Ogohlantirish',
        'Sizning ma\'lumotlaringiz admin tomonidan o\'chirildi.',
        [{ text: 'Tushunarli' }]
      );
    });

    return () => {
      unsubscribe();
    };
  }, [currentRoute, studentJshshir]);

  // Handlers
  const handleStudentLoginSuccess = (group: Group, jshshir: string) => {
    setLoggedInGroup(group);
    setStudentJshshir(jshshir);
    setCurrentRoute('student_home');
  };

  const handleLogout = async () => {
    await storageService.clearSession();
    setLoggedInGroup(null);
    setStudentJshshir('');
    setCurrentRoute('student_login');
  };

  if (isInitializing) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.base }]}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.secondaryText }]}>
          Yuklanmoqda...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.appRoot, { backgroundColor: colors.base }]}>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      {currentRoute === 'student_login' && (
        <StudentLoginScreen onLoginSuccess={handleStudentLoginSuccess} />
      )}

      {currentRoute === 'student_home' && loggedInGroup && (
        <StudentHomeScreen
          group={loggedInGroup}
          jshshir={studentJshshir}
          onLogout={handleLogout}
        />
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  appRoot: {
    flex: 1,
  },
});
