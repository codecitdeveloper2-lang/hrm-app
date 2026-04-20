import { useTheme } from '../../styles/ThemeProvider';
import React from 'react';
import {View, Text, StyleSheet, useWindowDimensions} from 'react-native';

export default function StatCard({
  title,
  value,
  subtext,
  subtextColor,
  icon,
  accentColor
}: any) {
  const { colors: THEME_COLORS } = useTheme();
  const styles = _getStyles(THEME_COLORS);
  
  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, {backgroundColor: accentColor || THEME_COLORS.accent}]} />
      
      <View style={styles.iconContainer}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      {subtext && (
        <View style={styles.subtextRow}>
          <Text style={[styles.subtext, {color: subtextColor || THEME_COLORS.textSecondary}]}>
            {subtext}
          </Text>
        </View>
      )}
    </View>
  );
}

const _getStyles = (COLORS: any) => StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 20,
    flex: 1,
    minHeight: 140,
    marginHorizontal: 6,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 16,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  subtextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtext: {
    fontSize: 11,
    fontWeight: '700',
  },
});
