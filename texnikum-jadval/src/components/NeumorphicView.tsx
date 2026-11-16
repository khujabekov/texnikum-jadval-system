import React from 'react';
import { Platform, View, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';

interface NeumorphicViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  borderRadius?: number;
  elevation?: number;
  offset?: number;
  variant?: 'convex' | 'flat';
}

export const NeumorphicView = React.memo<NeumorphicViewProps>(({
  children,
  style,
  contentStyle,
  borderRadius = 22,
  elevation = 6,
  offset = 6,
  variant = 'convex',
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  return (
    <View
      style={[
        {
          backgroundColor: colors.base,
          borderRadius,
          // iOS: outer dark shadow (bottom-right)
          shadowColor: colors.darkShadow,
          shadowOffset: { width: offset, height: offset },
          shadowOpacity: isDark ? 0.9 : 0.55,
          shadowRadius: offset + 2,
          // Android: elevation + directional specular rim borders
          elevation: Platform.OS === 'android' ? elevation : 0,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderBottomWidth: 1,
          borderRightWidth: 1,
          borderTopColor: colors.specularHighlight || (isDark ? colors.lightShadow : '#FFFFFF'),
          borderLeftColor: colors.specularHighlight || (isDark ? colors.lightShadow : '#FFFFFF'),
          borderBottomColor: colors.shadowEdge || (isDark ? colors.darkShadow : '#B8C4D4'),
          borderRightColor: colors.shadowEdge || (isDark ? colors.darkShadow : '#B8C4D4'),
        },
        style,
      ]}
    >
      {/* Inner surface with top-left specular highlight & 3D gradient */}
      <View
        style={{
          borderRadius: Math.max(0, borderRadius - 1),
          shadowColor: colors.lightShadow,
          shadowOffset: { width: -offset, height: -offset },
          shadowOpacity: isDark ? 0.45 : 0.95,
          shadowRadius: offset,
          overflow: 'hidden',
          flex: 1,
        }}
      >
        {variant === 'convex' ? (
          <LinearGradient
            colors={colors.surfaceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[{ flex: 1 }, contentStyle]}
          >
            {children}
          </LinearGradient>
        ) : (
          <View style={[{ backgroundColor: colors.base, flex: 1 }, contentStyle]}>
            {children}
          </View>
        )}
      </View>
    </View>
  );
});
