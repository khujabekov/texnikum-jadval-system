import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Group } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { maskJshshir } from '../../utils/formatters';
import { TodayScheduleTab } from './TodayScheduleTab';
import { WeeklyScheduleTab } from './WeeklyScheduleTab';
import { FloatingTabBar, StudentTabKey } from './components/FloatingTabBar';

interface StudentHomeScreenProps {
  group: Group;
  jshshir: string;
  onLogout: () => void;
}

export const StudentHomeScreen: React.FC<StudentHomeScreenProps> = ({
  group,
  jshshir,
  onLogout,
}) => {
  const { colors, mode } = useTheme();
  const [activeTab, setActiveTab] = useState<StudentTabKey>('today');

  const handleLogoutPress = () => {
    Alert.alert(
      'Tizimdan chiqish',
      'Haqiqatan ham hisobingizdan chiqmoqchimisiz?',
      [
        { text: 'Bekor qilish', style: 'cancel' },
        {
          text: 'Chiqish',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.base }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />

      {/* Neumorphic Student Header */}
      <Header
        title={group.name}
        subtitle={group.department}
        badge={`JSHSHIR: ${maskJshshir(jshshir)}`}
        onLogout={handleLogoutPress}
      />

      {/* Screen Body */}
      <View style={styles.body}>
        {activeTab === 'today' ? (
          <TodayScheduleTab groupId={group.id} groupName={group.name} />
        ) : (
          <WeeklyScheduleTab groupId={group.id} groupName={group.name} />
        )}
      </View>

      {/* Floating Neumorphic Bottom Tab Bar */}
      <FloatingTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
