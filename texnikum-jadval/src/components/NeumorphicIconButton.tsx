import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { triggerLightHaptic } from '../utils/haptics';

interface NeumorphicIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityLabel?: string;
}

export const NeumorphicIconButton: React.FC<NeumorphicIconButtonProps> = ({
  icon,
  onPress,
  size = 44,
  borderRadius,
  style,
  disabled = false,
  accessibilityLabel,
}) => {
  const { colors, mode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDark = mode === 'dark';
  const radius = borderRadius ?? size / 2;
  const offset = 4;

  const handlePressIn = () => {
    if (disabled) return;
    triggerLightHaptic();
    Animated.spring(scaleAnim, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 35,
      bounciness: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 35,
      bounciness: 3,
    }).start();
  };

  const dirBorders = {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderTopColor: colors.specularHighlight || (isDark ? colors.lightShadow : '#FFFFFF'),
    borderLeftColor: colors.specularHighlight || (isDark ? colors.lightShadow : '#FFFFFF'),
    borderBottomColor: colors.shadowEdge || (isDark ? colors.darkShadow : '#B8C4D4'),
    borderRightColor: colors.shadowEdge || (isDark ? colors.darkShadow : '#B8C4D4'),
  };

  return (
    <Animated.View
      style={[
        { transform: [{ scale: scaleAnim }], opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        accessibilityLabel={accessibilityLabel}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius,
            backgroundColor: colors.base,
            shadowColor: colors.darkShadow,
            shadowOffset: { width: offset, height: offset },
            shadowOpacity: isDark ? 0.85 : 0.55,
            shadowRadius: offset + 1,
            elevation: Platform.OS === 'android' ? offset : 0,
            alignItems: 'center',
            justifyContent: 'center',
            ...dirBorders,
          },
        ]}
      >
        <LinearGradient
          colors={colors.surfaceGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.inner,
            {
              width: size - 2,
              height: size - 2,
              borderRadius: radius - 1,
              shadowColor: colors.lightShadow,
              shadowOffset: { width: -offset, height: -offset },
              shadowOpacity: isDark ? 0.45 : 0.9,
              shadowRadius: offset,
            },
          ]}
        >
          {icon}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});
