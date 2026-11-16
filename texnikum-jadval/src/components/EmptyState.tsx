import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { NeumorphicView } from './NeumorphicView';

interface EmptyStateProps {
  iconName?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  isRestDay?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  iconName = 'calendar-outline',
  title,
  description,
  isRestDay = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <NeumorphicView
        borderRadius={24}
        contentStyle={styles.cardContent}
        style={styles.card}
      >
        <View
          style={[
            styles.iconWrapper,
            {
              backgroundColor: isRestDay ? colors.accentLight : colors.badgeBg,
            },
          ]}
        >
          <Ionicons
            name={iconName}
            size={48}
            color={isRestDay ? colors.accent : colors.secondaryText}
          />
        </View>

        <Text style={[styles.title, { color: colors.primaryText }]}>{title}</Text>

        {description ? (
          <Text style={[styles.description, { color: colors.secondaryText }]}>
            {description}
          </Text>
        ) : null}
      </NeumorphicView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
  },
  cardContent: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
});
