import React from 'react';
import {View, StyleSheet, ScrollView, useWindowDimensions} from 'react-native';
import WelcomeSection from '../../components/dashboard/WelcomeSection';
import StatusCard from '../../components/dashboard/StatusCard';
import StatCard from '../../components/dashboard/StatCard';
import ActivitySection from '../../components/dashboard/ActivitySection';
import SummaryPanel from '../../components/dashboard/SummaryPanel';
import { useGetClockInStatusQuery } from '../../store/api/apiSlice';

export default function DashboardPage() {
  const { width } = useWindowDimensions();
  const isResponsive = width < 1024;
  const isMobile = width < 768;

  const { data: statusData } = useGetClockInStatusQuery(undefined);
  const d = statusData?.data;

  const DASHBOARD_STATS = [
    {
      title: 'Total Working Hours',
      value: d?.totalDurationString ?? '0S',
      subtext: '+12% from yesterday',
      subtextColor: '#10B981',
      accentColor: '#6C63FF',
      icon: '🕐',
    },
    {
      title: 'Total Breaks',
      value: `${d?.totalBreakCount ?? 0} Sessions`,
      subtext: '+2 more than yesterday',
      subtextColor: '#F59E0B',
      accentColor: '#4ECDC4',
      icon: '☕',
    },
    {
      title: 'Break Duration',
      value: d?.totalBreakDurationString ?? '0S',
      accentColor: '#FFE66D',
      icon: '🛌',
    },
    {
      title: 'Productivity',
      value: `${d?.monthlyAttendancePercentage ?? 0}%`,
      subtext: '+3% from last week',
      subtextColor: '#10B981',
      accentColor: '#4DA8DA',
      icon: '📈',
    },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      <WelcomeSection />
      <StatusCard />

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {DASHBOARD_STATS.map((stat, index) => (
          <View 
            key={index} 
            style={{ 
              width: isMobile ? '100%' : isResponsive ? '48%' : '24%',
              minWidth: isMobile ? '100%' : 150,
            }}>
            <StatCard {...stat} />
          </View>
        ))}
      </View>

      {/* Bottom: Activity + Summary side by side */}
      <View style={[styles.bottomRow, isResponsive && styles.bottomRowMobile]}>
        <View style={[styles.activityCol, isResponsive && styles.activityColMobile]}>
          <ActivitySection />
        </View>
        <SummaryPanel />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bottomRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  activityCol: {
    flex: 1,
  },
  activityColMobile: {
    flex: 0,
    width: '100%',
  },
});
