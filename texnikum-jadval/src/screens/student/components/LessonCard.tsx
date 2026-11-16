import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Lesson } from '../../../types';
import { useTheme } from '../../../theme/ThemeContext';
import { NeumorphicView } from '../../../components/NeumorphicView';

export type LessonStatus = 'ongoing' | 'completed' | 'upcoming';

interface LessonCardProps {
  lesson: Lesson;
  index?: number;
  status?: LessonStatus;
  progressPercent?: number; // 0 - 100
  minutesRemaining?: number;
  isFirst?: boolean;
  isLast?: boolean;
  showTimeline?: boolean;
}

export const LessonCard = React.memo<LessonCardProps>(({
  lesson,
  index = 0,
  status = 'upcoming',
  progressPercent = 0,
  minutesRemaining = 0,
  isFirst = false,
  isLast = false,
  showTimeline = true,
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const isOngoing = status === 'ongoing';
  const isCompleted = status === 'completed';

  // Pulsing animation for ongoing live indicator
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isOngoing) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.35,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isOngoing]);

  const boundedProgress = Math.min(100, Math.max(0, Math.round(progressPercent)));

  const cardBody = (
    <NeumorphicView
      borderRadius={20}
      variant="convex"
      style={[
        styles.cardOuter,
        isOngoing && {
          borderWidth: 1.5,
          borderColor: colors.accent,
          shadowColor: colors.accent,
          shadowOpacity: isDark ? 0.45 : 0.25,
          shadowRadius: 8,
        },
      ]}
      contentStyle={styles.cardContent}
    >
      {/* ── TOP ROW: Time badge (left) + Room badge (right) ── */}
      <View style={styles.topRow}>
        <View
          style={[
            styles.timeBadge,
            {
              backgroundColor: isOngoing
                ? colors.accent
                : colors.badgeBg,
            },
          ]}
        >
          <Ionicons
            name="time-outline"
            size={12}
            color={isOngoing ? '#FFFFFF' : colors.accent}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[
              styles.timeText,
              { color: isOngoing ? '#FFFFFF' : colors.accent },
            ]}
            numberOfLines={1}
          >
            {lesson.timeRange}
          </Text>
        </View>

        {/* Room Badge */}
        <View
          style={[
            styles.roomBadge,
            {
              borderColor: colors.insetBorder,
              backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
            },
          ]}
        >
          <Ionicons name="location-outline" size={12} color={colors.secondaryText} />
          <Text
            style={[styles.roomText, { color: colors.primaryText }]}
            numberOfLines={1}
          >
            {lesson.roomNumber}
          </Text>
        </View>
      </View>

      {/* ── ONGOING LIVE STATUS PILL ── */}
      {isOngoing && (
        <View style={styles.livePillRow}>
          <View
            style={[
              styles.livePill,
              { backgroundColor: colors.accentLight, borderColor: colors.accent },
            ]}
          >
            <Animated.View
              style={[
                styles.livePulseDot,
                { backgroundColor: colors.accent, opacity: pulseAnim },
              ]}
            />
            <Text style={[styles.livePillText, { color: colors.accent }]}>
              JONLI • Dars ketmoqda
            </Text>
          </View>
        </View>
      )}

      {/* ── MIDDLE: Subject Name & Type ── */}
      <View style={styles.subjectRow}>
        <Text
          style={[styles.subjectName, { color: colors.primaryText }]}
          numberOfLines={2}
        >
          {lesson.subjectName}
        </Text>
        {lesson.type ? (
          <View
            style={[
              styles.typeBadge,
              {
                borderColor: colors.insetBorder,
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
              },
            ]}
          >
            <Text style={[styles.typeText, { color: colors.secondaryText }]}>
              {lesson.type}
            </Text>
          </View>
        ) : null}
      </View>

      {/* ── ONGOING PROGRESS BAR & REMAINING MINUTES ── */}
      {isOngoing && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: colors.secondaryText }]}>
              Davom etmoqda: {boundedProgress}%
            </Text>
            <Text style={[styles.progressRemaining, { color: colors.accent }]}>
              {minutesRemaining > 0 ? `${minutesRemaining} daqiqa qoldi` : 'Tugamoqda'}
            </Text>
          </View>
          <LinearGradient
            colors={colors.insetGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.progressTrack, { borderColor: colors.insetBorder }]}
          >
            <LinearGradient
              colors={colors.accentGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${boundedProgress}%` }]}
            />
          </LinearGradient>
        </View>
      )}

      {/* ── DIVIDER & TEACHER ROW ── */}
      <View style={[styles.divider, { backgroundColor: colors.insetBorder }]} />
      <View style={styles.teacherRow}>
        <View
          style={[
            styles.teacherAvatar,
            {
              backgroundColor: isOngoing
                ? colors.accentLight
                : isCompleted
                ? 'rgba(16, 185, 129, 0.15)'
                : colors.accentLight,
            },
          ]}
        >
          <Ionicons
            name={isCompleted ? 'checkmark' : 'person'}
            size={12}
            color={isCompleted ? colors.success : colors.accent}
          />
        </View>
        <Text
          style={[styles.teacherName, { color: colors.secondaryText }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {lesson.teacherName}
        </Text>
        {isCompleted && (
          <View style={[styles.completedBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
            <Text style={[styles.completedText, { color: colors.success }]}>
              Tugagan
            </Text>
          </View>
        )}
      </View>
    </NeumorphicView>
  );

  if (!showTimeline) {
    return (
      <View style={[styles.standaloneCard, isCompleted && { opacity: 0.72 }]}>
        {cardBody}
      </View>
    );
  }

  return (
    <View style={styles.timelineRow}>
      {/* ── Left Timeline Column ── */}
      <View style={styles.timelineColumn}>
        {/* Top Connecting Rail */}
        <View
          style={[
            styles.railSegment,
            {
              backgroundColor: isCompleted
                ? colors.success
                : colors.timelineRail,
              opacity: isFirst ? 0 : 1,
            },
          ]}
        />

        {/* 3D Circular Para Node */}
        {isOngoing ? (
          <LinearGradient
            colors={colors.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.nodeBase,
              styles.ongoingNode,
              {
                borderColor: colors.glowAccent,
                shadowColor: colors.accent,
              },
            ]}
          >
            <Text style={styles.ongoingNodeText}>{lesson.pairNumber}</Text>
          </LinearGradient>
        ) : isCompleted ? (
          <View
            style={[
              styles.nodeBase,
              styles.completedNode,
              {
                backgroundColor: isDark ? '#1C2E25' : '#E8F5E9',
                borderColor: colors.success,
              },
            ]}
          >
            <Ionicons name="checkmark-sharp" size={17} color={colors.success} />
          </View>
        ) : (
          <View
            style={[
              styles.nodeBase,
              styles.upcomingNode,
              {
                backgroundColor: colors.base,
                borderTopColor: colors.specularHighlight,
                borderLeftColor: colors.specularHighlight,
                borderBottomColor: colors.shadowEdge,
                borderRightColor: colors.shadowEdge,
                shadowColor: colors.darkShadow,
              },
            ]}
          >
            <Text style={[styles.upcomingNodeText, { color: colors.primaryText }]}>
              {lesson.pairNumber}
            </Text>
          </View>
        )}

        {/* Bottom Connecting Rail */}
        <View
          style={[
            styles.railSegment,
            {
              backgroundColor: isCompleted
                ? colors.timelineRail
                : colors.timelineRail,
              opacity: isLast ? 0 : 1,
            },
          ]}
        />
      </View>

      {/* ── Right Content Card Column ── */}
      <View style={[styles.cardColumn, isCompleted && { opacity: 0.72 }]}>
        {cardBody}
      </View>
    </View>
  );
});

// ── Minimalist Break Indicator Component ──
interface BreakIndicatorProps {
  durationText?: string;
}

export const BreakIndicator = React.memo<BreakIndicatorProps>(({
  durationText = 'Tanaffus',
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <View style={styles.breakRow}>
      <View style={styles.breakRailCol}>
        <View
          style={[
            styles.breakContinuousRail,
            { backgroundColor: colors.timelineRail },
          ]}
        />
        <View
          style={[
            styles.breakDot,
            {
              backgroundColor: colors.timelineRail,
              borderColor: colors.base,
            },
          ]}
        />
      </View>

      <View style={styles.breakContentCol}>
        <LinearGradient
          colors={colors.insetGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.breakPill,
            {
              borderColor: colors.insetBorder,
              borderTopColor: isDark ? colors.darkShadow : '#B8C4D4',
              borderBottomColor: colors.specularHighlight,
            },
          ]}
        >
          <Ionicons name="cafe-outline" size={12} color={colors.secondaryText} />
          <Text style={[styles.breakText, { color: colors.secondaryText }]}>
            • {durationText} •
          </Text>
        </LinearGradient>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  timelineRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  standaloneCard: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  timelineColumn: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  railSegment: {
    width: 2.5,
    flex: 1,
    borderRadius: 1.5,
  },
  nodeBase: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
    zIndex: 2,
  },
  ongoingNode: {
    borderWidth: 2.5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 5,
  },
  ongoingNodeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  completedNode: {
    borderWidth: 2,
  },
  upcomingNode: {
    borderWidth: 1,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  upcomingNodeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  cardColumn: {
    flex: 1,
    marginLeft: 10,
    minWidth: 0,
  },
  cardOuter: {
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    flexShrink: 1,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    gap: 4,
    flexShrink: 0,
    maxWidth: 130,
  },
  roomText: {
    fontSize: 11,
    fontWeight: '700',
    flexShrink: 1,
  },
  livePillRow: {
    marginBottom: 10,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  livePillText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 10,
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    flex: 1,
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    borderWidth: 1,
    flexShrink: 0,
    marginTop: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  progressRemaining: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  divider: {
    height: 1,
    marginBottom: 10,
    opacity: 0.4,
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teacherAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  teacherName: {
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  completedBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
    flexShrink: 0,
  },
  completedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  // Break Indicator Styles
  breakRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 32,
    alignItems: 'center',
  },
  breakRailCol: {
    width: 38,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    position: 'relative',
  },
  breakContinuousRail: {
    width: 2.5,
    height: '100%',
  },
  breakDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  breakContentCol: {
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  breakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    gap: 5,
  },
  breakText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
