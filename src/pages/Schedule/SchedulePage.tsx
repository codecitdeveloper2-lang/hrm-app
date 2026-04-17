import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { COLORS, globalStyles } from '../../styles';
import {
  useGetRosterQuery,
  useGetMyLeavesQuery
} from '../../store/api/apiSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function SchedulePage() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isResponsive = width < 1024;

  const user = useSelector((state: RootState) => state.auth.user);
  const [weekOffset, setWeekOffset] = useState(0);

  const formatDateKey = (date: Date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  };

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const workingHours = user?.workingHours;
  const startTime = workingHours?.startTime || "10:00";
  const endTime = workingHours?.endTime || "17:00";
  const weeklyOff = workingHours?.weeklyOff || ["Saturday", "Sunday"];

  const { weekStart, weekEnd, weekStartObj } = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    // Get Monday of current week
    const currentDay = now.getDay();
    const diff = now.getDate() - currentDay + (currentDay === 0 ? -6 : 1) + (weekOffset * 7);
    start.setDate(diff);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return {
      weekStart: formatDateKey(start),
      weekEnd: formatDateKey(end),
      weekStartObj: start
    };
  }, [weekOffset]);

  const { data: leavesResp, refetch: refetchLeaves } = useGetMyLeavesQuery({
    status: 'approved',
    startDate: weekStart,
    endDate: weekEnd
  }, { skip: !user });

  const { data: rosterResp, isFetching: rosterFetching, refetch: refetchRoster } = useGetRosterQuery({
    userId: user?._id || user?.id,
    startDate: weekStart,
    endDate: weekEnd
  }, { skip: !user });

  const rosterData = rosterResp?.success && rosterResp?.data?.length > 0 ? rosterResp.data[0] : null;
  const approvedLeaves = leavesResp?.data || [];

  const handleRefresh = () => {
    if (user) {
      refetchLeaves();
      refetchRoster();
    }
  };

  const shifts = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStartObj);
      day.setDate(weekStartObj.getDate() + i);
      const dayName = day.toLocaleDateString("en-US", { weekday: "long" });
      const dayKey = formatDateKey(day);
      const rosterShift = rosterData?.shiftData?.[dayKey];

      const isWeekend = rosterShift
        ? rosterShift.shiftType === 'off'
        : weeklyOff.includes(dayName);

      const isToday = day.toDateString() === new Date().toDateString();

      const leave = approvedLeaves.find((l: any) => {
        const start = new Date(l.startDate);
        const end = new Date(l.endDate);
        const checkDay = new Date(day);
        checkDay.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);
        return checkDay >= start && checkDay <= end;
      });

      let shiftDisplay = "";
      let shiftType = "Regular";
      let holidayName = "";

      if (leave) {
        shiftDisplay = "On Leave";
        shiftType = "Leave";
      } else if (rosterShift) {
        if (rosterShift.shiftType === 'Holiday') {
          shiftDisplay = "Holiday";
          holidayName = rosterShift.holidayName || "Public Holiday";
          shiftType = "Holiday";
        } else if (rosterShift.shiftType === 'off') {
          shiftDisplay = "Off";
          shiftType = "Off";
        } else {
          if (rosterShift.shifts && rosterShift.shifts.length > 0) {
            shiftDisplay = rosterShift.shifts.map((s: any) => `${formatTime(s.startTime)} - ${formatTime(s.endTime)}`).join(', ');
          } else if (rosterShift.startTime?.[0] && rosterShift.endTime?.[0]) {
            shiftDisplay = `${formatTime(rosterShift.startTime[0])} - ${formatTime(rosterShift.endTime[0])}`;
          } else {
            shiftDisplay = `${formatTime(startTime)} - ${formatTime(endTime)}`;
          }
        }
      } else {
        shiftDisplay = isWeekend ? "Off" : `${formatTime(startTime)} - ${formatTime(endTime)}`;
        shiftType = isWeekend ? "Off" : "Regular";
      }

      days.push({
        day: dayName,
        shortDay: day.toLocaleDateString("en-US", { weekday: "short" }),
        date: day.getDate(),
        shift: shiftDisplay,
        type: shiftType,
        isToday,
        isWeekend,
        leave,
        holiday: holidayName,
      });
    }
    return days;
  }, [weekStartObj, approvedLeaves, rosterData, startTime, endTime, weeklyOff]);

  const getWeekRange = () => {
    const end = new Date(weekStartObj);
    end.setDate(weekStartObj.getDate() + 6);
    return `${weekStartObj.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const todayShift = shifts.find(s => s.isToday);

  return (
    <View style={globalStyles.screenContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={rosterFetching} onRefresh={handleRefresh} tintColor={COLORS.accent} />
        }
      >

        {/* Top Controls - Navigation & Range */}
        <View style={styles.topControls}>
          <View style={styles.navControls}>
            <TouchableOpacity onPress={() => setWeekOffset(weekOffset - 1)} style={styles.navBtn}>
              <Text style={styles.navBtnText}>←</Text>
            </TouchableOpacity>
            <View style={styles.weekDisplay}>
              <Text style={styles.weekRangeText}>{getWeekRange()}</Text>
            </View>
            <TouchableOpacity onPress={() => setWeekOffset(weekOffset + 1)} style={styles.navBtn}>
              <Text style={styles.navBtnText}>→</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
            <Text style={styles.refreshIcon}>🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Today Highlight Section */}
        <View style={[
          styles.todayCard,
          todayShift?.type === 'Holiday' ? styles.holidayCard :
            todayShift?.type === 'Leave' ? styles.leaveCard :
              styles.regularCard
        ]}>
          <View style={styles.todayHeader}>
            <View>
              <Text style={styles.todayLabel}>
                {todayShift?.type === 'Holiday' ? 'PUBLIC HOLIDAY' :
                  todayShift?.type === 'Leave' ? "TODAY'S STATUS" : "TODAY'S SHIFT"}
              </Text>
              <Text style={styles.todayShiftValue}>
                {todayShift?.holiday || (todayShift?.type === 'Leave' ? `On Leave (${todayShift.leave.leaveType})` : todayShift?.shift)}
              </Text>
            </View>
            <View style={styles.todayIconContainer}>
              <Text style={styles.todayIcon}>
                {todayShift?.type === 'Holiday' ? '☀️' : todayShift?.type === 'Leave' ? '🏖️' : '⏱️'}
              </Text>
            </View>
          </View>

          {/* {todayShift?.type === 'Regular' && (
            <View style={styles.timeTagRow}>
              <View style={styles.timeTag}><Text style={styles.timeTagText}>Starts: {formatTime(startTime)}</Text></View>
              <View style={styles.timeTag}><Text style={styles.timeTagText}>Ends: {formatTime(endTime)}</Text></View>
            </View>
          )} */}
          {todayShift?.type === 'Leave' && todayShift?.leave?.reason && (
            <Text style={styles.leaveReasonText} numberOfLines={1}>"{todayShift.leave.reason}"</Text>
          )}
        </View>

        <View style={[styles.mainGrid, isResponsive && styles.columnLayout]}>
          {/* Weekly Schedule Breakdown */}
          <View style={styles.scheduleListContainer}>
            <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            <View style={styles.shiftList}>
              {shifts.map((item, index) => (
                <View key={index} style={[
                  styles.shiftItem,
                  item.isToday && styles.todayItem,
                  (item.isWeekend && !item.isToday) && styles.offDayItem
                ]}>
                  <View style={[
                    styles.dayBadge,
                    item.isToday && { backgroundColor: COLORS.accent },
                    item.type === 'Holiday' && { backgroundColor: COLORS.warning },
                    item.type === 'Leave' && { backgroundColor: COLORS.error },
                    (item.isWeekend && !item.isToday) && { backgroundColor: 'rgba(255,255,255,0.05)' }
                  ]}>
                    <Text style={[styles.dayText, (item.isToday || item.type === 'Holiday' || item.type === 'Leave') && { color: '#FFF' }]}>{item.shortDay}</Text>
                    <Text style={[styles.dateText, (item.isToday || item.type === 'Holiday' || item.type === 'Leave') && { color: '#FFF' }]}>{item.date}</Text>
                  </View>
                  <View style={styles.shiftInfo}>
                    <View style={styles.shiftInfoHeader}>
                      <Text style={styles.dayFull}>{item.day}</Text>
                      {item.isToday && <View style={styles.todayBadge}><Text style={styles.todayBadgeText}>Today</Text></View>}
                    </View>
                    <Text style={[
                      styles.shiftTimeText,
                      item.type === 'Holiday' ? { color: COLORS.warning } :
                        item.type === 'Leave' ? { color: COLORS.error } :
                          (item.isWeekend && !item.isToday) ? { color: '#94A3B8' } :
                            { color: COLORS.accentLight }
                    ]}>
                      {item.shift}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Summary Information */}
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Working Days</Text>
                <Text style={styles.summaryValue}>{7 - (weeklyOff?.length || 0)} Days</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Off Days</Text>
                <Text style={styles.summaryValue}>{(weeklyOff?.length || 0)} Days</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Shifts Description</Text>
                <Text style={styles.summaryValueSmall}>Regular {startTime}-{endTime} Shift</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>{user?.location || 'Kolkata'}</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  refreshBtn: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  refreshIcon: { fontSize: 16 },
  navControls: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navBtn: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  weekDisplay: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  weekRangeText: { color: COLORS.accentLight, fontWeight: '800', fontSize: 11 },

  todayCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  regularCard: { backgroundColor: COLORS.accent },
  holidayCard: { backgroundColor: COLORS.warning },
  leaveCard: { backgroundColor: COLORS.error },

  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  todayLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  todayShiftValue: { color: '#FFF', fontSize: 26, fontWeight: '800', marginTop: 4 },
  todayIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayIcon: { fontSize: 28 },

  timeTagRow: { flexDirection: 'row', gap: 12 },
  timeTag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  timeTagText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  leaveReasonText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontStyle: 'italic' },

  mainGrid: { flexDirection: 'row', gap: 24 },
  columnLayout: { flexDirection: 'column' },
  scheduleListContainer: { flex: 2 },
  summaryContainer: { flex: 1 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#FFF', marginBottom: 18 },
  shiftList: { gap: 12 },
  shiftItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  todayItem: {
    backgroundColor: 'rgba(45, 92, 255, 0.08)',
    borderColor: 'rgba(45, 92, 255, 0.3)',
    borderWidth: 2,
  },
  offDayItem: { opacity: 0.7 },
  dayBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  dayText: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' },
  dateText: { fontSize: 18, fontWeight: '800', color: '#FFF' },
  shiftInfo: { flex: 1 },
  shiftInfoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  dayFull: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  todayBadge: { backgroundColor: 'rgba(45, 92, 255, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  todayBadgeText: { color: COLORS.accent, fontSize: 10, fontWeight: '800' },
  shiftTimeText: { fontSize: 13, fontWeight: '600' },

  summaryCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  summaryItem: { paddingVertical: 12 },
  summaryLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  summaryValue: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  summaryValueSmall: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
});
