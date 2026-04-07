import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {COLORS, SPACING, BORDER_RADIUS} from '../../styles';

interface StatItemProps {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const StatItem = ({label, value, icon, color}: StatItemProps) => (
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
  return (
    <View style={styles.container}>
      <StatItem 
        label="Present" 
        value="18 Days" 
        icon="✅" 
        color={COLORS.success} 
      />
      <StatItem 
        label="Late" 
        value="2 Days" 
        icon="🕒" 
        color={COLORS.warning} 
      />
      <StatItem 
        label="Absent" 
        value="1 Day" 
        icon="❌" 
        color={COLORS.error} 
      />
      <StatItem 
        label="Avg Hours" 
        value="8.5h" 
        icon="📊" 
        color={COLORS.info} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
