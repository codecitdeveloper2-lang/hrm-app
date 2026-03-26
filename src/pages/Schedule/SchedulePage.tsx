import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {COLORS, globalStyles} from '../../styles';
import Header from '../../components/layout/Header';

export default function SchedulePage() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const shifts = [
    {day: 'Mon', time: '09:00 - 18:00', type: 'Morning'},
    {day: 'Tue', time: '09:00 - 18:00', type: 'Morning'},
    {day: 'Wed', time: '10:00 - 19:00', type: 'Mid'},
    {day: 'Thu', time: '09:00 - 18:00', type: 'Morning'},
    {day: 'Fri', time: 'Off', type: 'Weekend'},
  ];

  return (
    <View style={globalStyles.screenContainer}>
      <Header title="Schedule" subtitle="Your assigned work shifts" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={globalStyles.glassCard}>
          <Text style={styles.title}>Current Week</Text>
          <View style={styles.timeline}>
            {shifts.map((shift, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.dayCol}>
                  <Text style={styles.dayName}>{shift.day}</Text>
                </View>
                <View style={[styles.shiftCard, shift.type === 'Weekend' && styles.offShift]}>
                  <Text style={styles.shiftTime}>{shift.time}</Text>
                  <Text style={styles.shiftType}>{shift.type} Shift</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {padding: 24},
  title: {fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 20},
  timeline: {gap: 16},
  timelineItem: {flexDirection: 'row', alignItems: 'center'},
  dayCol: {width: 60},
  dayName: {fontSize: 14, fontWeight: '600', color: COLORS.accentLight},
  shiftCard: {
    flex: 1,
    backgroundColor: COLORS.bgMid,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.accent,
  },
  offShift: {borderLeftColor: COLORS.textMuted, opacity: 0.6},
  shiftTime: {fontSize: 15, fontWeight: '700', color: COLORS.white},
  shiftType: {fontSize: 12, color: COLORS.textSecondary, marginTop: 4},
});
