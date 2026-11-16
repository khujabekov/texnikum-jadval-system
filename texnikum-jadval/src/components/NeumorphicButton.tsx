import React, { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { triggerLightHaptic } from '../utils/haptics';

interface NeumorphicButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'base' | 'accent' | 'danger';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  title,
  onPress,
  variant = 'base',
  icon,
  style,
  textStyle,
  disabled = false,
  size = 'medium',
  fullWidth = false,
}) => {
  const { colors, mode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isDark = mode === 'dark';

  const handlePressIn = () => {
    if (disabled) return;
    triggerLightHaptic();
    Animated.spring(scaleAnim, {
      toValue: 0.96,
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

  const paddingVertical = size === 'small' ? 9 : size === 'large' ? 16 : 13;
  const paddingHorizontal = size === 'small' ? 14 : size === 'large' ? 24 : 20;
  const fontSize = size === 'small' ? 13 : size === 'large' ? 16 : 15;
  const borderRadius = size === 'small' ? 13 : 18;
  const offset = size === 'small' ? 3 : 5;

  const isAccent = variant === 'accent';
  const isDanger = variant === 'danger';

  // 3D Specular rim borders
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
        {
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.55 : 1,
          alignSelf: fullWidth ? 'stretch' : 'auto',
        },
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.outer,
          fullWidth && { width: '100%' },
          {
            borderRadius,
            shadowColor: colors.darkShadow,
            shadowOffset: { width: offset, height: offset },
            shadowOpacity: isDark ? 0.85 : 0.5,
            shadowRadius: offset + 1,
            elevation: Platform.OS === 'android' ? offset : 0,
            ...(!isAccent && !isDanger ? dirBorders : {}),
          },
        ]}
      >
        {isAccent ? (
          <LinearGradient
            colors={colors.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.inner,
              {
                borderRadius,
                paddingVertical,
                paddingHorizontal,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
              },
            ]}
          >
            <View style={styles.contentRow}>
              {icon ? <View style={styles.iconMargin}>{icon}</View> : null}
              <Text
                numberOfLines={1}
                style={[
                  styles.text,
                  { color: '#FFFFFF', fontSize, fontWeight: '700' },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </View>
          </LinearGradient>
        ) : isDanger ? (
          <View
            style={[
              styles.inner,
              {
                backgroundColor: colors.danger,
                borderRadius,
                paddingVertical,
                paddingHorizontal,
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderColor: 'rgba(255,255,255,0.25)',
              },
            ]}
          >
            <View style={styles.contentRow}>
              {icon ? <View style={styles.iconMargin}>{icon}</View> : null}
              <Text
                numberOfLines={1}
                style={[
                  styles.text,
                  { color: '#FFFFFF', fontSize, fontWeight: '700' },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </View>
          </View>
        ) : (
          // Base 3D Sculpted convex cushion
          <LinearGradient
            colors={colors.surfaceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.inner,
              {
                borderRadius,
                paddingVertical,
                paddingHorizontal,
                shadowColor: colors.lightShadow,
                shadowOffset: { width: -offset, height: -offset },
                shadowOpacity: isDark ? 0.45 : 0.9,
                shadowRadius: offset,
                ...dirBorders,
              },
            ]}
          >
            <View style={styles.contentRow}>
              {icon ? <View style={styles.iconMargin}>{icon}</View> : null}
              <Text
                numberOfLines={1}
                style={[
                  styles.text,
                  { color: colors.primaryText, fontSize, fontWeight: '600' },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </View>
          </LinearGradient>
        )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'transparent',
    width: '100%',
  },
  inner: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
  },
  iconMargin: {
    marginRight: 8,
    flexShrink: 0,
  },
  text: {
    letterSpacing: 0.2,
    flexShrink: 1,
  },
});
