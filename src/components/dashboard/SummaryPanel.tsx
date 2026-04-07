import React from 'react';
import {View, Text, StyleSheet, useWindowDimensions} from 'react-native';
import { useGetClockInStatusQuery } from '../../store/api/apiSlice';

export default function SummaryPanel() {
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;
  const { data: statusData } = useGetClockInStatusQuery(undefined);

  const monthlyPercentage = statusData?.data?.monthlyAttendancePercentage ?? 0;
  const clampedPct = Math.min(100, Math.max(0, monthlyPercentage));

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Quick Summary</Text>

        {/* Shift Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shift Type</Text>
          <View style={styles.shiftRow}>
            <Text style={styles.sectionValue}>Morning Session</Text>
            <View style={styles.activeDot} />
          </View>
        </View>

        <View style={styles.divider} />

        {/* Weekly Off */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly Off</Text>
          <Text style={styles.sectionValue}>Saturday, Sunday</Text>
        </View>

        <View style={styles.divider} />

        {/* Monthly Attendance */}
        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={styles.sectionTitle}>Monthly Attendance</Text>
            <Text style={styles.percentageText}>{monthlyPercentage.toFixed(2)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${clampedPct}%` }]} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 290,
    marginLeft: 20,
  },
  containerMobile: {
    width: '100%',
    marginLeft: 0,
    marginTop: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  sectionValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  shiftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2D5CFF',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: '#2D5CFF',
    borderRadius: 3,
    minWidth: 4,
  },
});
