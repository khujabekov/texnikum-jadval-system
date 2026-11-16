import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeContext';
import { NeumorphicView } from '../../../components/NeumorphicView';
import { triggerLightHaptic } from '../../../utils/haptics';

export type StudentTabKey = 'today' | 'weekly';

interface FloatingTabBarProps {
  activeTab: StudentTabKey;
  onTabChange: (tab: StudentTabKey) => void;
}

export const FloatingTabBar: React.FC<FloatingTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.floatingWrapper} pointerEvents="box-none">
      <NeumorphicView
        borderRadius={34}
        variant="convex"
        style={styles.navBar}
        contentStyle={styles.navContent}
      >
        <TabItem
          label="Bugungi darslar"
          icon="today-outline"
          activeIcon="today"
          isActive={activeTab === 'today'}
          onPress={() => onTabChange('today')}
        />
        <TabItem
          label="Haftalik jadval"
          icon="calendar-outline"
          activeIcon="calendar"
          isActive={activeTab === 'weekly'}
          onPress={() => onTabChange('weekly')}
        />
      </NeumorphicView>
    </View>
  );
};

interface TabItemProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({
  label,
  icon,
  activeIcon,
  isActive,
  onPress,
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    triggerLightHaptic();
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
    <Animated.View style={[styles.tabFlex, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.tabPressable}
      >
        {isActive ? (
          // Active: 3D sculpted accent pill with specular top border
          <LinearGradient
            colors={colors.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.activeTab,
              {
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.4)',
                borderLeftColor: 'rgba(255,255,255,0.4)',
                borderBottomWidth: 1,
                borderRightWidth: 1,
                borderBottomColor: 'rgba(0,0,0,0.2)',
                borderRightColor: 'rgba(0,0,0,0.2)',
              },
            ]}
          >
            <Ionicons name={activeIcon} size={18} color="#FFFFFF" />
            <Text style={styles.activeTabText} numberOfLines={1}>
              {label}
            </Text>
          </LinearGradient>
        ) : (
          // Inactive: subtle recessed feel
          <View
            style={[
              styles.inactiveTab,
              {
                backgroundColor: isDark ? 'rgba(21,24,27,0.3)' : 'rgba(163,177,198,0.08)',
              },
            ]}
          >
            <Ionicons name={icon} size={18} color={colors.secondaryText} />
            <Text
              style={[styles.inactiveTabText, { color: colors.secondaryText }]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 20,
    left: 16,
    right: 16,
    alignItems: 'center',
  },
  navBar: {
    width: '100%',
  },
  navContent: {
    flexDirection: 'row',
    padding: 6,
    alignItems: 'center',
  },
  tabFlex: {
    flex: 1,
  },
  tabPressable: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  activeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 28,
    gap: 8,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
    flexShrink: 1,
  },
  inactiveTab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 28,
    gap: 8,
  },
  inactiveTabText: {
    fontWeight: '600',
    fontSize: 14,
    flexShrink: 1,
  },
});
