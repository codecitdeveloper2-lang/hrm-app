import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {COLORS, globalStyles} from '../../styles';
import MainLayout from '../../components/layout/MainLayout';
import Header from '../../components/layout/Header';

export default function DashboardPage() {
  const stats = [
    {label: 'Total Employees', value: '124', icon: '👥', color: '#6C63FF'},
    {label: 'On Leave', value: '18', icon: '📅', color: '#4ECDC4'},
    {label: 'New Requests', value: '7', icon: '✉️', color: '#FFE66D'},
    {label: 'Present Today', value: '106', icon: '✅', color: '#4DA8DA'},
  ];

  return (
    <View style={globalStyles.screenContainer}>
      <Header title="Dashboard" subtitle="Overview of your workspace" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIconContainer, {backgroundColor: stat.color + '20'}]}>
                <Text style={styles.statEmoji}>{stat.icon}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={globalStyles.glassCard}>
            <ActivityItem text="Sarah requested leave for next Monday" time="2h ago" type="leave" />
            <ActivityItem text="New employee 'Mike' added to Engineering" time="5h ago" type="user" />
            <ActivityItem text="Attendance report for March is ready" time="1d ago" type="report" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const ActivityItem = ({text, time, type}: {text: string, time: string, type: string}) => (
  <View style={styles.activityItem}>
    <View style={styles.activityDot} />
    <View style={{flex: 1}}>
      <Text style={styles.activityText}>{text}</Text>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  content: {
    padding: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.bgMid,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
    marginRight: 16,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});
