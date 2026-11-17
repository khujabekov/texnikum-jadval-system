import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  AppState,
  AppStateStatus,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Lesson, Weekday } from '../../types';
import { storageService } from '../../services/storageService';
import { useTheme } from '../../theme/ThemeContext';
import { LessonCard, BreakIndicator, LessonStatus } from './components/LessonCard';
import { EmptyState } from '../../components/EmptyState';
import { NeumorphicView } from '../../components/NeumorphicView';
import { NeumorphicIconButton } from '../../components/NeumorphicIconButton';
import { calculateLessonProgress } from '../../utils/time';
import { triggerLightHaptic } from '../../utils/haptics';
import { notificationService } from '../../services/notificationService';

interface TodayScheduleTabProps {
  groupId: string;
  groupName: string;
}

const UZBEK_DAYS: Weekday[] = [
  'Yakshanba',  // 0 – Sunday
  'Dushanba',   // 1
  'Seshanba',   // 2
  'Chorshanba', // 3
  'Payshanba',  // 4
  'Juma',       // 5
  'Shanba',     // 6
];

const UZBEK_MONTHS = [
  'yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun',
  'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr',
];

interface LessonRuntimeState {
  status: LessonStatus;
  progressPercent: number;
  minutesRemaining: number;
}

export const TodayScheduleTab: React.FC<TodayScheduleTabProps> = ({
  groupId,
  groupName,
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [todayName, setTodayName] = useState<Weekday>('Dushanba');
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTimeMinutes, setCurrentTimeMinutes] = useState<number>(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  const lastDayIndexRef = useRef<number>(new Date().getDay());

  const loadTodaySchedule = useCallback(async () => {
    try {
      const now = new Date();
      const dayIndex = now.getDay();
      lastDayIndexRef.current = dayIndex;
      const currentWeekday = UZBEK_DAYS[dayIndex];
      setTodayName(currentWeekday);
      const dayNum = now.getDate();
      const monthName = UZBEK_MONTHS[now.getMonth()];
      setFormattedDate(`${dayNum}-${monthName}, ${currentWeekday}`);

      if (currentWeekday === 'Yakshanba') {
        setLessons([]);
      } else {
        const list = await storageService.getLessons(groupId, currentWeekday);
        list.sort((a, b) => a.pairNumber - b.pairNumber);
        setLessons(list);
      }
    } catch {
      // Graceful fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [groupId]);

  useEffect(() => {
    loadTodaySchedule();

    // Real-time Firestore onSnapshot subscription for schedule changes made on Web Admin
    const unsubscribe = storageService.subscribeToGroupSchedule(groupId, (updatedLessons) => {
      const now = new Date();
      const currentWeekday = UZBEK_DAYS[now.getDay()];
      if (currentWeekday !== 'Yakshanba') {
        const todayLessons = updatedLessons.filter((l) => l.day === currentWeekday);
        todayLessons.sort((a, b) => a.pairNumber - b.pairNumber);
        setLessons(todayLessons);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [loadTodaySchedule, groupId]);

  // Real-time tick & AppState lifecycle management
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      const d = new Date();
      setCurrentTimeMinutes(d.getHours() * 60 + d.getMinutes());

      // Midnight check: if day rolled over, reload schedule
      if (d.getDay() !== lastDayIndexRef.current) {
        loadTodaySchedule();
      }
    };

    const startTimer = () => {
      if (timer) clearInterval(timer);
      tick();
      // Tick every 20 seconds for optimal battery & smooth UI
      timer = setInterval(tick, 20000);
    };

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    startTimer();

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        startTimer();
      } else {
        stopTimer();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      stopTimer();
      subscription.remove();
    };
  }, [loadTodaySchedule]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTodaySchedule();
  };

  const isSunday = todayName === 'Yakshanba';

  // Compute status for each lesson via centralized utility
  const lessonStates = useMemo(() => {
    const states: Record<string, LessonRuntimeState> = {};
    for (const lesson of lessons) {
      const result = calculateLessonProgress(lesson.timeRange, currentTimeMinutes);
      states[lesson.id] = {
        status: result.status,
        progressPercent: result.progressPercent,
        minutesRemaining: result.minutesRemaining,
      };
    }
    return states;
  }, [lessons, currentTimeMinutes]);

  // Overall summary metrics
  const activeOngoingLesson = useMemo(
    () => lessons.find((l) => lessonStates[l.id]?.status === 'ongoing'),
    [lessons, lessonStates]
  );

  const allCompleted = useMemo(
    () => lessons.length > 0 && lessons.every((l) => lessonStates[l.id]?.status === 'completed'),
    [lessons, lessonStates]
  );

  const nextUpcoming = useMemo(
    () => lessons.find((l) => lessonStates[l.id]?.status === 'upcoming'),
    [lessons, lessonStates]
  );

  const reminder = useMemo(() => {
    return notificationService.getNextLessonReminder(lessons, currentTimeMinutes);
  }, [lessons, currentTimeMinutes]);

  const handleShareTodaySchedule = async () => {
    triggerLightHaptic();
    if (lessons.length === 0) {
      await Share.share({
        message: `📅 Sirdaryo Ilg'or Kasbiy Mahorat Texnikumi\n👥 Guruh: ${groupName}\n🗓 ${formattedDate}\n\nBugun darslar mavjud emas (Dam olish kuni).`,
      });
      return;
    }

    let text = `📅 Sirdaryo Ilg'or Kasbiy Mahorat Texnikumi\n👥 Guruh: ${groupName}\n🗓 ${formattedDate}\n\n`;
    for (const les of lessons) {
      text += `🔹 ${les.pairNumber}-para (${les.timeRange})\n`;
      text += `📖 Fan: ${les.subjectName}\n`;
      text += `👨‍🏫 O'qituvchi: ${les.teacherName}\n`;
      text += `🚪 Xona: ${les.roomNumber}\n\n`;
    }
    text += `📱 Blitz Soft group`;

    await Share.share({
      title: `${groupName} - Bugungi Dars Jadvali`,
      message: text,
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
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
      {/* ── Hero Sculpted 3D Summary Card ── */}
      <View style={styles.bannerContainer}>
        <NeumorphicView
          borderRadius={24}
          variant="convex"
          style={styles.bannerCard}
          contentStyle={styles.bannerContent}
        >
          {/* Top section: Icon + Day Title + Lesson Count */}
          <View style={styles.bannerTopRow}>
            <View style={styles.bannerLeft}>
              <View
                style={[
                  styles.dayIconCircle,
                  {
                    backgroundColor: colors.accentLight,
                    borderColor: activeOngoingLesson ? colors.accent : colors.insetBorder,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons
                  name={isSunday ? 'cafe-outline' : activeOngoingLesson ? 'pulse' : 'calendar'}
                  size={22}
                  color={colors.accent}
                />
              </View>

              <View style={styles.bannerTextCol}>
                <Text
                  style={[styles.dateText, { color: colors.secondaryText }]}
                  numberOfLines={1}
                >
                  {formattedDate}
                </Text>
                <Text
                  style={[styles.dayTitle, { color: colors.primaryText }]}
                  numberOfLines={1}
                >
                  {isSunday ? 'Dam olish kuni' : `${todayName} • Jadval`}
                </Text>
              </View>
            </View>

            {/* Right: Badge & Share Button */}
            <View style={styles.bannerRight}>
              <View style={[styles.countBadge, { backgroundColor: colors.badgeBg }]}>
                <Text style={[styles.countText, { color: colors.accent }]}>
                  {lessons.length} ta para
                </Text>
              </View>
              <NeumorphicIconButton
                size={34}
                icon={
                  <Ionicons
                    name="share-social-outline"
                    size={17}
                    color={colors.accent}
                  />
                }
                onPress={handleShareTodaySchedule}
              />
            </View>
          </View>

          {/* Sub-bar: Real-time Live Status Row */}
          {!isSunday && lessons.length > 0 && (
            <View
              style={[
                styles.liveStatusRow,
                {
                  borderTopColor: colors.insetBorder,
                  backgroundColor: isDark ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.45)',
                },
              ]}
            >
              {activeOngoingLesson ? (
                <>
                  <View style={[styles.statusDot, { backgroundColor: colors.accent }]} />
                  <Text
                    style={[styles.liveStatusText, { color: colors.accent }]}
                    numberOfLines={1}
                  >
                    Hozir {activeOngoingLesson.pairNumber}-para darsi ketmoqda
                  </Text>
                </>
              ) : reminder ? (
                <>
                  <Ionicons name="notifications" size={15} color="#D97706" />
                  <Text
                    style={[
                      styles.liveStatusText,
                      { color: '#D97706', fontWeight: '800' },
                    ]}
                    numberOfLines={1}
                  >
                    Darsga {reminder.minutesUntilLesson} daqiqa qoldi: {reminder.lesson.subjectName} ({reminder.lesson.roomNumber}-xona)
                  </Text>
                </>
              ) : allCompleted ? (
                <>
                  <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                  <Text
                    style={[styles.liveStatusText, { color: colors.success }]}
                    numberOfLines={1}
                  >
                    Bugungi barcha darslar yakunlandi
                  </Text>
                </>
              ) : nextUpcoming ? (
                <>
                  <Ionicons name="time" size={14} color={colors.secondaryText} />
                  <Text
                    style={[styles.liveStatusText, { color: colors.secondaryText }]}
                    numberOfLines={1}
                  >
                    Keyingi dars: {nextUpcoming.timeRange.split('-')[0].trim()} da
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="school-outline" size={14} color={colors.secondaryText} />
                  <Text
                    style={[styles.liveStatusText, { color: colors.secondaryText }]}
                    numberOfLines={1}
                  >
                    Bugun darslar davom etadi
                  </Text>
                </>
              )}
            </View>
          )}
        </NeumorphicView>
      </View>

      {/* ── Schedule Content ── */}
      {isSunday ? (
        <EmptyState
          iconName="cafe"
          title="Bugun dam olish kuni"
          description="Darslar mavjud emas. Yangi haftaga kuch to'plang!"
          isRestDay
        />
      ) : lessons.length === 0 && !loading ? (
        <EmptyState
          iconName="file-tray-outline"
          title="Bugun darslar belgilanmagan"
          description={`${groupName} uchun bugungi kunda dars jadvali kiritilmagan.`}
        />
      ) : (
        <View style={styles.timelineList}>
          {lessons.map((lesson, index) => {
            const isFirst = index === 0;
            const isLast = index === lessons.length - 1;
            const state = lessonStates[lesson.id] || {
              status: 'upcoming',
              progressPercent: 0,
              minutesRemaining: 0,
            };

            return (
              <React.Fragment key={lesson.id}>
                <LessonCard
                  lesson={lesson}
                  index={index}
                  status={state.status}
                  progressPercent={state.progressPercent}
                  minutesRemaining={state.minutesRemaining}
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
          })}
        </View>
      )}

      {/* Bottom spacer so floating tab bar never covers content */}
      <View style={{ height: 110 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 10,
  },
  bannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  bannerCard: {
    width: '100%',
  },
  bannerContent: {
    padding: 16,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  bannerTextCol: {
    flex: 1,
    minWidth: 0,
  },
  dayIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 11,
    flexShrink: 0,
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
    marginLeft: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '800',
  },
  liveStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    paddingHorizontal: 10,
    paddingBottom: 8,
    borderRadius: 10,
    borderTopWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  liveStatusText: {
    fontSize: 12,
    fontWeight: '700',
    flexShrink: 1,
  },
  timelineList: {
    paddingTop: 4,
    paddingBottom: 8,
  },
});
