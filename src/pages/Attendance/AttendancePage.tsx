import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, useWindowDimensions, TextInput, TouchableOpacity, Alert} from 'react-native';
import {COLORS} from '../../styles';
import StatusCard from '../../components/dashboard/StatusCard';
import StatCard from '../../components/dashboard/StatCard';
import Button from '../../components/common/Button';
import { 
  useGetClockInStatusQuery, 
} from '../../store/api/apiSlice';
import CorrectionModal from '../../components/attendance/CorrectionModal';
import AttendanceStats from '../../components/attendance/AttendanceStats';

export default function AttendancePage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isResponsive = width < 1024;
  
  const { data: statusData } = useGetClockInStatusQuery(undefined);

  // Current Date for header
  const headerDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const todayShortDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  // Derived values from API response
  const d = statusData?.data;
  const isClockedIn = d?.isClockedIn ?? false;
  const checkInTime = d?.currentSession?.checkIn?.time
    ? new Date(d.currentSession.checkIn.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
    : '-';
  const sessionDuration = d?.currentSession?.durationString ?? '0h 0m';
  const totalDuration = d?.totalDurationString ?? '0h 0m';
  const totalBreakCount = d?.totalBreakCount ?? 0;
  const totalBreakDuration = d?.totalBreakDurationString ?? '0S';
  const monthlyPresentDays = d?.monthlyPresentDays ?? 0;
  const monthlyWorkingDays = d?.monthlyWorkingDaysSoFar ?? 0;
  const monthlyTarget = d?.monthlyTargetHours ?? 209;
  const monthlyPercentage = d?.monthlyAttendancePercentage ?? 14.29;

  const ATTENDANCE_STATS = [
    {
      title: "Today's Hours",
      value: sessionDuration,
      accentColor: '#10B981',
      icon: '⏱️',
    },
    {
      title: 'Total Breaks',
      value: `${totalBreakDuration} (${totalBreakCount})`,
      accentColor: '#3B82F6',
      icon: '☕',
    },
    {
      title: 'Monthly Present',
      value: `${monthlyPresentDays}`,
      accentColor: '#8B5CF6',
      icon: '🗓️',
    },
    {
      title: 'Performance',
      value: `${monthlyPercentage}%`,
      accentColor: '#F59E0B',
      icon: '🕒',
    },
  ];

  return (
    <>
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      
      {/* Header with Date */}
      <View style={styles.header}>
        <Text style={[styles.title, isMobile && {fontSize: 22}]}>Attendance</Text>
        {!isMobile && <Text style={styles.headerDate}>{headerDateString}</Text>}
      </View>

      <StatusCard />

      {/* Attendance Stats Cards */}
      <View style={styles.statsRow}>
        {ATTENDANCE_STATS.map((stat, index) => (
          <View key={index} style={{ width: isMobile ? '100%' : isResponsive ? '48%' : '24%', minWidth: isMobile ? '100%' : 150 }}>
            <StatCard {...stat} />
          </View>
        ))}
      </View>

      <View style={[styles.bottomLayout, isResponsive && styles.columnLayout]}>
        {/* Today's Details Section */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Today's Details</Text>
          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{headerDateString}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={[styles.statusBadge, isClockedIn && styles.statusBadgeActive]}>
                <Text style={[styles.statusBadgeText, isClockedIn && styles.statusBadgeTextActive]}>
                  {isClockedIn ? 'Present' : 'Absent'}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Last Action</Text>
              <Text style={styles.detailValue}>{checkInTime}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Net Working Time</Text>
              <Text style={[styles.detailValue, {color: '#3B82F6'}]}>{d?.netDurationString ?? '0h 0m'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Break Duration</Text>
              <Text style={[styles.detailValue, {color: '#F59E0B'}]}>{totalBreakDuration} ({totalBreakCount})</Text>
            </View>
          </View>
        </View>

        {/* This Week's Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>This Week's Summary</Text>
          <View style={styles.detailsCard}>
             <View style={styles.summaryHeader}>
               <Text style={styles.summaryHeaderText}>DAY</Text>
               <Text style={styles.summaryHeaderText}>HOURS</Text>
             </View>
            {[
              {day: 'Mon', date: todayShortDate, time: d?.netDurationString ?? '0h 0m', active: true},
              {day: 'Tue', date: 'Mar 31', time: '-', active: false},
            ].map((item, index, arr) => (
              <React.Fragment key={item.day}>
                <View style={styles.weekItem}>
                  <View style={styles.weekItemLeft}>
                    <View style={[styles.dayCircle, item.active && styles.dayCircleActive]}>
                       <Text style={[styles.dayInitial, item.active && styles.dayInitialActive]}>{item.day[0]}</Text>
                    </View>
                    <View>
                      <Text style={styles.dayName}>{item.day}</Text>
                      <Text style={styles.dayDate}>{item.date}</Text>
                    </View>
                  </View>
                  <Text style={styles.weekTime}>{item.time}</Text>
                </View>
                {index < arr.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>


    </ScrollView>
    {d?.requiresLogoutCorrection && d?.incompleteShift && (d?.incompleteShift?.loginTime || d?.incompleteShift?.checkIn?.time) && (
      <CorrectionModal 
        isVisible={true} 
        data={{
          shiftId: d.incompleteShift.shiftId || d.incompleteShift._id,
          shiftDate: d.incompleteShift.shiftDate,
          loginTime: d.incompleteShift.loginTime || d.incompleteShift.checkIn?.time,
        }} 
      />
    )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  headerDate: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  bottomLayout: {
    flexDirection: 'row',
    marginTop: 32,
    gap: 24,
  },
  columnLayout: {
    flexDirection: 'column',
  },
  detailsSection: {
    flex: 3,
  },
  summarySection: {
    flex: 2,
  },
  correctionSection: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  statusBadgeTextActive: {
    color: '#166534',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryHeaderText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  weekItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#3B82F6',
  },
  dayInitial: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  dayInitialActive: {
    color: '#FFFFFF',
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  dayDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  weekTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
  },
  emptyText: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 14,
    paddingVertical: 20,
  },

});
