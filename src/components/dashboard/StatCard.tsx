import React from 'react';
import {View, Text, StyleSheet, Dimensions, useWindowDimensions} from 'react-native';
import {COLORS} from '../../styles';

export default function StatCard({
  title,
  value,
  subtext,
  subtextColor = COLORS.textSecondary,
  icon,
  accentColor = COLORS.accent
}: any) {
  const { width } = useWindowDimensions();
  const isMobile = width < 700;

  return (
    <View style={styles.card}>
      <View style={[styles.accentBar, {backgroundColor: accentColor}]} />
      
      <View style={styles.iconContainer}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>

      <Text style={styles.value}>{value}</Text>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      {subtext && (
        <View style={styles.subtextRow}>
          <Text style={[styles.subtext, {color: subtextColor}]}>
            {subtext}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F1F5F9',
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
    color: '#1E293B',
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
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
