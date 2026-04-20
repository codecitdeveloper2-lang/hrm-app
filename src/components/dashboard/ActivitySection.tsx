import React from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import {useGetRecentActivityQuery} from '../../store/api/apiSlice';
import { useTheme } from '../../styles/ThemeProvider';

const ActivityItem = ({ time, title, description, duration, type, isLast, COLORS }: any) => {
  const getIconColor = () => {
    switch (type) {
      case 'CLOCK_IN': return '#10B981'; // Green
      case 'CLOCK_OUT': return '#EF4444'; // Red
      case 'BREAK_START': return '#F59E0B'; // Amber
      case 'BREAK_END': return '#3B82F6'; // Blue
      default: return COLORS.accent;
    }
  };

  return (
    <View style={styles.activityItem}>
      <View style={styles.timelineContainer}>
        <View style={[styles.timelineDot, { backgroundColor: getIconColor() }]} />
        {!isLast && <View style={[styles.timelineLine, {backgroundColor: COLORS.cardBorder}]} />}
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={[styles.activityTitle, {color: COLORS.textPrimary}]}>{title}</Text>
          <Text style={[styles.activityTime, {color: COLORS.textSecondary}]}>{time}</Text>
        </View>
        {(description || duration) && (
          <Text style={[styles.activityDesc, {color: COLORS.textSecondary}]}>
            {description}{duration ? ` • ${duration}` : ''}
          </Text>
        )}
      </View>
    </View>
  );
};

export default function ActivitySection() {
  const { colors: THEME_COLORS } = useTheme();
  const today = new Date().toISOString().split('T')[0];
  const { data, isLoading, isError } = useGetRecentActivityQuery({ date: today });
  
  const activities = (data as any)?.data?.activities || [];
  const hasActivities = activities.length > 0;

  const formatActivityTime = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch {
      return '';
    }
  };

  return (
    <View style={[styles.card, {backgroundColor: THEME_COLORS.cardBg, borderColor: THEME_COLORS.cardBorder}]}>
      <View style={styles.cardHeader}>
        <Text style={[styles.sectionTitle, {color: THEME_COLORS.textPrimary}]}>Recent Activity</Text>
      </View>
      
      {isLoading && !hasActivities ? (
        <ActivityIndicator color={THEME_COLORS.accent} size="small" style={styles.loader} />
      ) : isError ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, {color: THEME_COLORS.textSecondary}]}>Failed to load activity feed</Text>
        </View>
      ) : !hasActivities ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, {color: THEME_COLORS.textSecondary, marginVertical: 10}]}>No activity recorded for today yet</Text>
        </View>
      ) : (
        <View style={styles.activityList}>
          {activities.map((item: any, index: number) => (
            <ActivityItem
              key={index}
              time={formatActivityTime(item.timestamp)}
              type={item.type}
              title={item.title}
              description={item.description}
              duration={item.metadata?.duration}
              isLast={index === activities.length - 1}
              COLORS={THEME_COLORS}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  loader: {
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  activityList: {
    width: '100%',
  },
  activityItem: {
    flexDirection: 'row',
    minHeight: 60,
  },
  timelineContainer: {
    width: 20,
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 6,
    zIndex: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    position: 'absolute',
    top: 16,
    bottom: 0,
  },
  activityContent: {
    flex: 1,
    paddingBottom: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  activityTime: {
    fontSize: 11,
    fontWeight: '600',
  },
  activityDesc: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
});
