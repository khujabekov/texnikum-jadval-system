import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Group } from '../../types';
import { useTheme } from '../../theme/ThemeContext';
import { Header } from '../../components/Header';
import { NeumorphicView } from '../../components/NeumorphicView';
import { NeumorphicButton } from '../../components/NeumorphicButton';
import { maskJshshir } from '../../utils/formatters';
import { triggerLightHaptic } from '../../utils/haptics';
import { TodayScheduleTab } from './TodayScheduleTab';
import { WeeklyScheduleTab } from './WeeklyScheduleTab';
import { FloatingTabBar, StudentTabKey } from './components/FloatingTabBar';
import { BellsScheduleModal } from './components/BellsScheduleModal';

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
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showBellsModal, setShowBellsModal] = useState(false);

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
        onBells={() => {
          triggerLightHaptic();
          setShowBellsModal(true);
        }}
        onInfo={() => {
          triggerLightHaptic();
          setShowInfoModal(true);
        }}
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

      {/* Info & Contacts Modal */}
      <Modal
        visible={showInfoModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowInfoModal(false)}
          />

          <View style={styles.modalContainer}>
            <NeumorphicView
              borderRadius={28}
              style={styles.modalOuter}
              contentStyle={styles.modalContent}
            >
              {/* Header Icon */}
              <View
                style={[
                  styles.modalIconWrap,
                  { backgroundColor: colors.accentLight },
                ]}
              >
                <Ionicons name="school" size={32} color={colors.accent} />
              </View>

              <Text style={[styles.modalTitle, { color: colors.primaryText }]}>
                Sirdaryo Ilg'or Kasbiy Mahorat Texnikumi
              </Text>
              <Text
                style={[styles.modalSubtitle, { color: colors.secondaryText }]}
              >
                Dars jadvali axborot tizimi
              </Text>

              {/* Group & Student Details */}
              <View
                style={[
                  styles.infoBox,
                  {
                    backgroundColor: colors.base,
                    borderColor: colors.insetBorder,
                  },
                ]}
              >
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>
                    Guruh:
                  </Text>
                  <Text style={[styles.infoVal, { color: colors.primaryText }]}>
                    {group.name}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>
                    Yo'nalish:
                  </Text>
                  <Text style={[styles.infoVal, { color: colors.primaryText }]}>
                    {group.department}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>
                    JSHSHIR:
                  </Text>
                  <Text style={[styles.infoVal, { color: colors.accent }]}>
                    {maskJshshir(jshshir)}
                  </Text>
                </View>
              </View>

              {/* Developer */}
              <View style={styles.devSection}>
                <View style={styles.devHeaderRow}>
                  <Ionicons name="code-slash" size={16} color={colors.accent} />
                  <Text style={[styles.devTitle, { color: colors.primaryText }]}>
                    Dasturchi:{' '}
                    <Text style={{ color: colors.accent, fontWeight: '800' }}>
                      Blitz Soft group
                    </Text>
                  </Text>
                </View>
              </View>

              {/* Close Button */}
              <NeumorphicButton
                title="Yopish"
                variant="accent"
                size="medium"
                onPress={() => setShowInfoModal(false)}
                style={styles.closeBtn}
              />
            </NeumorphicView>
          </View>
        </View>
      </Modal>

      {/* Bells Schedule Modal */}
      <BellsScheduleModal
        visible={showBellsModal}
        onClose={() => setShowBellsModal(false)}
      />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    zIndex: 10,
  },
  modalOuter: {
    width: '100%',
  },
  modalContent: {
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 22,
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    marginVertical: 14,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  devSection: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 10,
  },
  devHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  devTitle: {
    fontSize: 13,
  },
  closeBtn: {
    width: '100%',
    marginTop: 16,
  },
});
