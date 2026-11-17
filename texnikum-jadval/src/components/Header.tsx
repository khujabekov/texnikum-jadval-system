import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { NeumorphicIconButton } from './NeumorphicIconButton';

interface HeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  onLogout?: () => void;
  onBack?: () => void;
  onInfo?: () => void;
  onBells?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  badge,
  onLogout,
  onBack,
  onInfo,
  onBells,
  rightAction,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Left section: flex: 1 — MUST shrink to give right buttons room */}
      <View style={styles.leftRow}>
        {onBack ? (
          <NeumorphicIconButton
            size={40}
            icon={<Ionicons name="arrow-back" size={20} color={colors.primaryText} />}
            onPress={onBack}
            style={styles.backBtn}
          />
        ) : null}

        <View style={styles.titleColumn}>
          {badge ? (
            <View style={[styles.badgeWrap, { backgroundColor: colors.badgeBg }]}>
              <Text
                style={[styles.badgeText, { color: colors.accent }]}
                numberOfLines={1}
              >
                {badge}
              </Text>
            </View>
          ) : null}
          <Text
            style={[styles.title, { color: colors.primaryText }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, { color: colors.secondaryText }]}
              numberOfLines={1}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Right section: fixed-shrink, never grows */}
      <View style={styles.rightRow}>
        <ThemeToggle />
        {onBells ? (
          <NeumorphicIconButton
            size={38}
            icon={<Ionicons name="notifications-outline" size={18} color={colors.accent} />}
            onPress={onBells}
          />
        ) : null}
        {onInfo ? (
          <NeumorphicIconButton
            size={38}
            icon={<Ionicons name="information-circle-outline" size={19} color={colors.accent} />}
            onPress={onInfo}
          />
        ) : null}
        {rightAction ? <View style={{ flexShrink: 0 }}>{rightAction}</View> : null}
        {onLogout ? (
          <NeumorphicIconButton
            size={38}
            icon={<Ionicons name="log-out-outline" size={18} color={colors.danger} />}
            onPress={onLogout}
          />
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    minHeight: 64,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // flex: 1 is the key — allows title to shrink when right buttons are present
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  backBtn: {
    marginRight: 10,
    flexShrink: 0,
  },
  titleColumn: {
    flex: 1,
    minWidth: 0,
  },
  badgeWrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 7,
    marginBottom: 3,
    maxWidth: '100%',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
});
