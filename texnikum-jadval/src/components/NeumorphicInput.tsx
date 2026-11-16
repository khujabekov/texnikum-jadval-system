import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextInputProps,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface NeumorphicInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  inputContainerStyle?: StyleProp<ViewStyle>;
  onClear?: () => void;
  showClearButton?: boolean;
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputContainerStyle,
  value,
  onClear,
  showClearButton = false,
  multiline = false,
  style,
  ...restProps
}) => {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? (
        <Text style={[styles.label, { color: colors.secondaryText }]}>{label}</Text>
      ) : null}

      <LinearGradient
        colors={colors.insetGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.insetContainer,
          {
            // Deep carved inset simulation with specular bottom-right rim
            borderTopWidth: isFocused ? 2 : 1.5,
            borderLeftWidth: isFocused ? 2 : 1.5,
            borderBottomWidth: 1,
            borderRightWidth: 1,
            borderTopColor: isFocused
              ? colors.accent
              : error
              ? colors.danger
              : isDark
              ? colors.darkShadow
              : '#A8B7C7',
            borderLeftColor: isFocused
              ? colors.accent
              : error
              ? colors.danger
              : isDark
              ? colors.darkShadow
              : '#A8B7C7',
            borderBottomColor: isFocused
              ? colors.accent
              : colors.specularHighlight || 'rgba(255,255,255,0.85)',
            borderRightColor: isFocused
              ? colors.accent
              : colors.specularHighlight || 'rgba(255,255,255,0.85)',
            minHeight: multiline ? 112 : 56,
            alignItems: multiline ? 'flex-start' : 'center',
          },
          inputContainerStyle,
        ]}
      >
        {leftIcon ? (
          <View style={[styles.iconContainer, multiline && styles.iconMultiline]}>
            {leftIcon}
          </View>
        ) : null}

        <TextInput
          value={value}
          placeholderTextColor={
            isDark ? 'rgba(148,163,184,0.55)' : 'rgba(100,116,139,0.55)'
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          style={[
            styles.input,
            {
              color: colors.primaryText,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            multiline && { minHeight: 90, paddingTop: 12 },
            style,
          ]}
          {...restProps}
        />

        {showClearButton && value && value.length > 0 && onClear ? (
          <Pressable onPress={onClear} hitSlop={12} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={19} color={colors.secondaryText} />
          </Pressable>
        ) : rightIcon ? (
          <View style={styles.iconContainer}>{rightIcon}</View>
        ) : null}
      </LinearGradient>

      {error ? (
        <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 7,
    marginLeft: 4,
    letterSpacing: 0.1,
  },
  insetContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingHorizontal: 14,
    overflow: 'hidden',
  },
  iconContainer: {
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  iconMultiline: {
    marginTop: 14,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 14,
    minWidth: 0, // prevents flex overflow
  },
  clearBtn: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 6,
    fontWeight: '500',
  },
});
