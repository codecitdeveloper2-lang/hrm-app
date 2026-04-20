import React from 'react';
import {View, Text, StyleSheet, useWindowDimensions} from 'react-native';
import { useGetClockInStatusQuery } from '../../store/api/apiSlice';
import { useTheme } from '../../styles/ThemeProvider';

export default function SummaryPanel() {
  const { colors: THEME_COLORS } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 1024;
  const { data: statusData } = useGetClockInStatusQuery(undefined);

  const monthlyPercentage = statusData?.data?.monthlyAttendancePercentage ?? 0;
  const clampedPct = Math.min(100, Math.max(0, monthlyPercentage));

  return (
    <View style={[styles.container, isMobile && styles.containerMobile]}>
      <View style={[styles.summaryCard, {backgroundColor: THEME_COLORS.cardBg, borderColor: THEME_COLORS.cardBorder}]}>
        <Text style={[styles.cardTitle, {color: THEME_COLORS.textPrimary}]}>Quick Summary</Text>

        {/* Shift Type */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: THEME_COLORS.textSecondary}]}>Shift Type</Text>
          <View style={styles.shiftRow}>
            <Text style={[styles.sectionValue, {color: THEME_COLORS.textPrimary}]}>Morning Session</Text>
            <View style={[styles.activeDot, {backgroundColor: THEME_COLORS.success}]} />
          </View>
        </View>

        <View style={[styles.divider, {backgroundColor: THEME_COLORS.cardBorder}]} />

        {/* Weekly Off */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, {color: THEME_COLORS.textSecondary}]}>Weekly Off</Text>
          <Text style={[styles.sectionValue, {color: THEME_COLORS.textPrimary}]}>Saturday, Sunday</Text>
        </View>

        <View style={[styles.divider, {backgroundColor: THEME_COLORS.cardBorder}]} />

        {/* Monthly Attendance */}
        <View style={styles.section}>
          <View style={styles.progressHeader}>
            <Text style={[styles.sectionTitle, {color: THEME_COLORS.textSecondary}]}>Monthly Attendance</Text>
            <Text style={[styles.percentageText, {color: THEME_COLORS.accent}]}>{monthlyPercentage.toFixed(2)}%</Text>
          </View>
          <View style={[styles.progressTrack, {backgroundColor: THEME_COLORS.inputBg}]}>
            <View style={[styles.progressFill, { width: `${clampedPct}%`, backgroundColor: THEME_COLORS.accent }]} />
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
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 20,
  },
  section: {
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  sectionValue: {
    fontSize: 15,
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
  },
  divider: {
    height: 1,
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
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
    minWidth: 4,
  },
});
