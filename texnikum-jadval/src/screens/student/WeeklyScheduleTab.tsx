import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  RefreshControl,
  Platform,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Lesson, Weekday, WEEKDAYS } from '../../types';
import { storageService } from '../../services/storageService';
import { useTheme } from '../../theme/ThemeContext';
import { LessonCard, BreakIndicator } from './components/LessonCard';
import { EmptyState } from '../../components/EmptyState';
import { triggerLightHaptic } from '../../utils/haptics';

interface WeeklyScheduleTabProps {
  groupId: string;
  groupName: string;
}

export const WeeklyScheduleTab: React.FC<WeeklyScheduleTabProps> = ({
  groupId,
  groupName,
}) => {
  const { colors, mode } = useTheme();
  const [selectedDay, setSelectedDay] = useState<Weekday>('Dushanba');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLessons = useCallback(async () => {
    try {
      const list = await storageService.getLessons(groupId, selectedDay);
      list.sort((a, b) => a.pairNumber - b.pairNumber);
      setLessons(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId, selectedDay]);

  useEffect(() => {
    loadLessons();

    // Real-time Firestore onSnapshot subscription for schedule changes made on Web Admin
    const unsubscribe = storageService.subscribeToGroupSchedule(groupId, (updatedLessons) => {
      const dayLessons = updatedLessons.filter((l) => l.day === selectedDay);
      dayLessons.sort((a, b) => a.pairNumber - b.pairNumber);
      setLessons(dayLessons);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [loadLessons, groupId, selectedDay]);

  const onRefresh = () => {
    setRefreshing(true);
    loadLessons();
  };

  const handleShareWeeklySchedule = async () => {
    triggerLightHaptic();
    if (lessons.length === 0) {
      await Share.share({
        message: `📅 Sirdaryo Ilg'or Kasbiy Mahorat Texnikumi\n👥 Guruh: ${groupName}\n🗓 Kun: ${selectedDay}\n\nUshbu kunda darslar mavjud emas.`,
      });
      return;
    }

    let text = `📅 Sirdaryo Ilg'or Kasbiy Mahorat Texnikumi\n👥 Guruh: ${groupName}\n🗓 Kun: ${selectedDay}\n\n`;
    for (const les of lessons) {
      text += `🔹 ${les.pairNumber}-para (${les.timeRange})\n`;
      text += `📖 Fan: ${les.subjectName}\n`;
      text += `👨‍🏫 O'qituvchi: ${les.teacherName}\n`;
      text += `🚪 Xona: ${les.roomNumber}\n\n`;
    }
    text += `📱 Blitz Soft group`;

    await Share.share({
      title: `${groupName} - ${selectedDay} Dars Jadvali`,
      message: text,
    });
  };

  const handleSelectDay = (day: Weekday) => {
    triggerLightHaptic();
    setSelectedDay(day);
  };

  return (
    <View style={styles.container}>
      {/* ── Horizontal Day Selector Pills ── */}
      <View style={styles.pillsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContent}
        >
          {WEEKDAYS.map((day) => (
            <DayPill
              key={day.key}
              shortLabel={day.shortLabel}
              isActive={selectedDay === day.key}
              onPress={() => handleSelectDay(day.key)}
            />
          ))}
        </ScrollView>
      </View>

      {/* ── Info Bar ── */}
      <View style={styles.infoBar}>
        <View style={styles.infoLeft}>
          <Ionicons name="calendar-clear" size={15} color={colors.accent} />
          <Text style={[styles.infoDay, { color: colors.primaryText }]} numberOfLines={1}>
            {selectedDay}
          </Text>
        </View>
        <View style={styles.infoRight}>
          <Text style={[styles.infoCount, { color: colors.secondaryText }]}>
            {lessons.length} ta dars
          </Text>
          <Pressable
            onPress={handleShareWeeklySchedule}
            hitSlop={8}
            style={({ pressed }) => [
              styles.shareIconBtn,
              { backgroundColor: colors.accentLight, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Ionicons name="share-social-outline" size={15} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      {/* ── Timeline Lessons List ── */}
      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        }
      >
        {lessons.length === 0 && !loading ? (
          <EmptyState
            iconName="calendar-outline"
            title={`${selectedDay} kunida dars yo'q`}
            description={`${groupName} uchun ushbu kunda jadval mavjud emas.`}
          />
        ) : (
          lessons.map((lesson, idx) => {
            const isFirst = idx === 0;
            const isLast = idx === lessons.length - 1;

            return (
              <React.Fragment key={lesson.id}>
                <LessonCard
                  lesson={lesson}
                  index={idx}
                  status="upcoming"
                  isFirst={isFirst}
                  isLast={isLast}
                  showTimeline={true}
                />
                {!isLast && (
                  <BreakIndicator
                    key={`break-${lesson.id}`}
                    durationText="Tanaffus"
                  />
                )}
              </React.Fragment>
            );
          })
        )}
        {/* Extra bottom padding for floating tab bar */}
        <View style={{ height: 110 }} />
      </ScrollView>
    </View>
  );
};

// ── Day Pill Component ──
interface DayPillProps {
  shortLabel: string;
  isActive: boolean;
  onPress: () => void;
}

const DayPill = React.memo<DayPillProps>(({ shortLabel, isActive, onPress }) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    triggerLightHaptic();
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
      speed: 35,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {isActive ? (
          // Active: Deep inset with LinearGradient + specular rim
          <LinearGradient
            colors={colors.insetGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.pillActive,
              {
                borderTopWidth: 1.5,
                borderLeftWidth: 1.5,
                borderBottomWidth: 1,
                borderRightWidth: 1,
                borderTopColor: isDark ? colors.darkShadow : '#B8C4D4',
                borderLeftColor: isDark ? colors.darkShadow : '#B8C4D4',
                borderBottomColor: colors.specularHighlight,
                borderRightColor: colors.specularHighlight,
              },
            ]}
          >
            <Text style={[styles.pillTextActive, { color: colors.accent }]}>
              {shortLabel}
            </Text>
            <View style={[styles.pillDot, { backgroundColor: colors.accent }]} />
          </LinearGradient>
        ) : (
          // Inactive: 3D convex cushion
          <LinearGradient
            colors={colors.surfaceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.pillInactive,
              {
                shadowColor: colors.darkShadow,
                shadowOffset: { width: 3, height: 3 },
                shadowOpacity: isDark ? 0.75 : 0.45,
                shadowRadius: 3,
                elevation: Platform.OS === 'android' ? 3 : 0,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderBottomWidth: 1,
                borderRightWidth: 1,
                borderTopColor: colors.specularHighlight,
                borderLeftColor: colors.specularHighlight,
                borderBottomColor: colors.shadowEdge,
                borderRightColor: colors.shadowEdge,
              },
            ]}
          >
            <Text style={[styles.pillTextInactive, { color: colors.primaryText }]}>
              {shortLabel}
            </Text>
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillsWrapper: {
    paddingVertical: 12,
  },
  pillsContent: {
    paddingHorizontal: 16,
    gap: 10,
    alignItems: 'center',
  },
  pillActive: {
    width: 62,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTextActive: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 4,
  },
  pillInactive: {
    width: 62,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillTextInactive: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 6,
    marginBottom: 4,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  infoDay: {
    fontSize: 15,
    fontWeight: '700',
    flexShrink: 1,
  },
  infoCount: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 0,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  shareIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
  },
});
