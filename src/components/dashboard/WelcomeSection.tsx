import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {COLORS} from '../../styles';

export default function WelcomeSection() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftSide}>
        <Text style={styles.heading}>Welcome back, John!</Text>
        <Text style={styles.subtext}>Here’s what’s happening with your work today</Text>
      </View>
      
      <View style={styles.rightSide}>
        <View style={styles.dateBadge}>
          <Text style={styles.calendarIcon}>📅</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  leftSide: {
    flex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  subtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  rightSide: {
    marginLeft: 20,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  calendarIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
});
