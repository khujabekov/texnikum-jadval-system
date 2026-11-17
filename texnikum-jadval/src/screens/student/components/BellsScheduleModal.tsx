import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { NeumorphicView } from '../../../components/NeumorphicView';
import { NeumorphicButton } from '../../../components/NeumorphicButton';

interface BellsScheduleModalProps {
  visible: boolean;
  onClose: () => void;
}

interface BellItem {
  type: 'para' | 'break';
  number?: number;
  label: string;
  timeRange: string;
  startMinutes: number;
  endMinutes: number;
  note?: string;
}

const BELLS_SCHEDULE: BellItem[] = [
  {
    type: 'para',
    number: 1,
    label: '1-para',
    timeRange: '08:30 – 09:50',
    startMinutes: 8 * 60 + 30,
    endMinutes: 9 * 60 + 50,
  },
  {
    type: 'break',
    label: 'Tanaffus',
    timeRange: '09:50 – 10:05',
    startMinutes: 9 * 60 + 50,
    endMinutes: 10 * 60 + 5,
    note: '15 daqiqa',
  },
  {
    type: 'para',
    number: 2,
    label: '2-para',
    timeRange: '10:05 – 11:25',
    startMinutes: 10 * 60 + 5,
    endMinutes: 11 * 60 + 25,
  },
  {
    type: 'break',
    label: 'Tanaffus',
    timeRange: '11:25 – 11:40',
    startMinutes: 11 * 60 + 25,
    endMinutes: 11 * 60 + 40,
    note: '15 daqiqa',
  },
  {
    type: 'para',
    number: 3,
    label: '3-para',
    timeRange: '11:40 – 13:00',
    startMinutes: 11 * 60 + 40,
    endMinutes: 13 * 60,
  },
  {
    type: 'break',
    label: 'Katta tanaffus (Tushlik)',
    timeRange: '13:00 – 13:40',
    startMinutes: 13 * 60,
    endMinutes: 13 * 60 + 40,
    note: '40 daqiqa',
  },
  {
    type: 'para',
    number: 4,
    label: '4-para',
    timeRange: '13:40 – 15:00',
    startMinutes: 13 * 60 + 40,
    endMinutes: 15 * 60,
  },
  {
    type: 'break',
    label: 'Tanaffus',
    timeRange: '15:00 – 15:10',
    startMinutes: 15 * 60,
    endMinutes: 15 * 60 + 10,
    note: '10 daqiqa',
  },
  {
    type: 'para',
    number: 5,
    label: '5-para',
    timeRange: '15:10 – 16:30',
    startMinutes: 15 * 60 + 10,
    endMinutes: 16 * 60 + 30,
  },
];

export const BellsScheduleModal: React.FC<BellsScheduleModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors } = useTheme();

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />

        <View style={styles.modalContainer}>
          <NeumorphicView
            borderRadius={28}
            style={styles.modalOuter}
            contentStyle={styles.modalContent}
          >
            {/* Header */}
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: colors.accentLight },
              ]}
            >
              <Ionicons name="notifications" size={28} color={colors.accent} />
            </View>

            <Text style={[styles.modalTitle, { color: colors.primaryText }]}>
              Qo'ng'iroqlar Jadvali
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.secondaryText }]}>
              Dars va tanaffus vaqtlari tartibi
            </Text>

            {/* List */}
            <ScrollView
              style={styles.listContainer}
              showsVerticalScrollIndicator={false}
            >
              {BELLS_SCHEDULE.map((item, index) => {
                const isActive =
                  currentMinutes >= item.startMinutes &&
                  currentMinutes < item.endMinutes;

                if (item.type === 'break') {
                  return (
                    <View
                      key={index}
                      style={[
                        styles.breakRow,
                        isActive && styles.activeBreakRow,
                      ]}
                    >
                      <View style={styles.breakLeft}>
                        <Ionicons
                          name={item.note?.includes('40') ? 'cafe' : 'pause-circle-outline'}
                          size={14}
                          color={isActive ? colors.accent : colors.secondaryText}
                        />
                        <Text
                          style={[
                            styles.breakLabel,
                            {
                              color: isActive ? colors.accent : colors.secondaryText,
                              fontWeight: isActive ? '700' : '500',
                            },
                          ]}
                        >
                          {item.label}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.breakTime,
                          { color: isActive ? colors.accent : colors.secondaryText },
                        ]}
                      >
                        {item.timeRange}
                      </Text>
                    </View>
                  );
                }

                return (
                  <View
                    key={index}
                    style={[
                      styles.paraCard,
                      {
                        backgroundColor: isActive ? colors.accentLight : colors.base,
                        borderColor: isActive ? colors.accent : colors.insetBorder,
                      },
                    ]}
                  >
                    <View style={styles.paraLeft}>
                      <View
                        style={[
                          styles.paraNumberCircle,
                          {
                            backgroundColor: isActive ? colors.accent : colors.badgeBg,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.paraNumberText,
                            { color: isActive ? '#FFFFFF' : colors.primaryText },
                          ]}
                        >
                          {item.number}
                        </Text>
                      </View>
                      <View>
                        <Text
                          style={[
                            styles.paraLabel,
                            { color: colors.primaryText },
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isActive && (
                          <Text style={[styles.activeTag, { color: colors.accent }]}>
                            ● Hozir dars ketmoqda
                          </Text>
                        )}
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.paraTime,
                        {
                          color: isActive ? colors.accent : colors.primaryText,
                          fontWeight: isActive ? '800' : '600',
                        },
                      ]}
                    >
                      {item.timeRange}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <NeumorphicButton
              title="Yopish"
              variant="accent"
              size="medium"
              onPress={onClose}
              style={styles.closeBtn}
            />
          </NeumorphicView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    zIndex: 10,
  },
  modalOuter: {
    width: '100%',
  },
  modalContent: {
    padding: 22,
    alignItems: 'center',
  },
  iconWrap: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
    marginBottom: 14,
    textAlign: 'center',
  },
  listContainer: {
    width: '100%',
    maxHeight: 340,
    marginVertical: 4,
  },
  paraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 3,
  },
  paraLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paraNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paraNumberText: {
    fontSize: 13,
    fontWeight: '700',
  },
  paraLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  activeTag: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  paraTime: {
    fontSize: 13,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 14,
    marginVertical: 1,
  },
  activeBreakRow: {
    borderRadius: 8,
    paddingVertical: 6,
  },
  breakLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  breakLabel: {
    fontSize: 11,
  },
  breakTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    width: '100%',
    marginTop: 16,
  },
});
