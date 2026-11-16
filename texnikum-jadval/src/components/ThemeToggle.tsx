import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { triggerSelectionHaptic } from '../utils/haptics';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme, colors } = useTheme();
  const isDark = mode === 'dark';
  const animatedValue = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isDark ? 1 : 0,
      useNativeDriver: true,
      friction: 7,
      tension: 60,
    }).start();
  }, [isDark]);

  const handleToggle = () => {
    triggerSelectionHaptic();
    toggleTheme();
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26],
  });

  return (
    <Pressable
      onPress={handleToggle}
      accessibilityRole="switch"
      accessibilityLabel="Mavzuni almashtirish"
      style={styles.container}
    >
      <LinearGradient
        colors={colors.insetGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.track,
          {
            // Deep inset simulation
            borderTopWidth: 1.5,
            borderLeftWidth: 1.5,
            borderBottomWidth: 1,
            borderRightWidth: 1,
            borderTopColor: isDark ? colors.darkShadow : '#B8C4D4',
            borderLeftColor: isDark ? colors.darkShadow : '#B8C4D4',
            borderBottomColor: colors.specularHighlight || 'rgba(255,255,255,0.8)',
            borderRightColor: colors.specularHighlight || 'rgba(255,255,255,0.8)',
          },
        ]}
      >
        {/* Background icons */}
        <View style={styles.bgIcons}>
          <Ionicons
            name="sunny"
            size={12}
            color={!isDark ? '#F59E0B' : colors.secondaryText}
          />
          <Ionicons
            name="moon"
            size={12}
            color={isDark ? '#818CF8' : colors.secondaryText}
          />
        </View>

        {/* 3D Sliding knob */}
        <Animated.View
          style={[
            styles.knobWrapper,
            {
              transform: [{ translateX }],
            },
          ]}
        >
          <LinearGradient
            colors={colors.surfaceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.knob,
              {
                shadowColor: colors.darkShadow,
                shadowOffset: { width: 2, height: 2 },
                shadowOpacity: isDark ? 0.9 : 0.6,
                shadowRadius: 3,
                elevation: 3,
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
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={12}
              color={isDark ? '#818CF8' : '#F59E0B'}
            />
          </LinearGradient>
        </Animated.View>
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 2,
  },
  track: {
    width: 56,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bgIcons: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  knobWrapper: {
    position: 'absolute',
    width: 26,
    height: 26,
    top: 3,
    left: 0,
  },
  knob: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
