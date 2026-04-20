import { useTheme } from '../../styles/ThemeProvider';
import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {COLORS, SPACING, BORDER_RADIUS} from '../../styles';

interface StatItemProps {
  label: string;
  value: string;
  icon: string;
  color: string;
  styles: any;
}

const StatItem = ({label, value, icon, color, styles}: StatItemProps) => (
  <View style={[styles.statItem, {borderColor: color + '30'}]}>
    <View style={[styles.iconContainer, {backgroundColor: color + '15'}]}>
      <Text style={styles.icon}>{icon}</Text>
    </View>
    <View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, {color}]}>{value}</Text>
    </View>
  </View>
);

export default function AttendanceStats() {
  const { colors: THEME_COLORS } = useTheme();
  const styles = _getStyles(THEME_COLORS);
  return (
    <View style={styles.container}>
      <StatItem 
        label="Present" 
        value="18 Days" 
        icon="✅" 
        color={THEME_COLORS.success} 
        styles={styles}
      />
      <StatItem 
        label="Late" 
        value="2 Days" 
        icon="🕒" 
        color={THEME_COLORS.warning} 
        styles={styles}
      />
      <StatItem 
        label="Absent" 
        value="1 Day" 
        icon="❌" 
        color={THEME_COLORS.error} 
        styles={styles}
      />
      <StatItem 
        label="Avg Hours" 
        value="8.5h" 
        icon="📊" 
        color={THEME_COLORS.info} 
        styles={styles}
      />
    </View>
  );
}

const _getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    minWidth: 150,
    backgroundColor: COLORS.bgMid,
    borderRadius: BORDER_RADIUS.lg,
    padding: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
});
