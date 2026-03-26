import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {COLORS, globalStyles} from '../../styles';
import Header from '../../components/layout/Header';
import Button from '../../components/common/Button';

export default function LeavePage() {
  const requests = [
    {type: 'Sick Leave', range: '12 Apr - 14 Apr', days: '3', status: 'Approved', color: '#4ECDC4'},
    {type: 'Casual Leave', range: '05 Apr - 06 Apr', days: '2', status: 'Pending', color: '#FFE66D'},
    {type: 'Vacation', range: '20 Mar - 25 Mar', days: '6', status: 'Approved', color: '#4ECDC4'},
  ];

  return (
    <View style={globalStyles.screenContainer}>
      <Header 
        title="Leave Requests" 
        subtitle="Manage your time off"
        rightAction={<Button title="New Request" size="sm" onPress={() => {}} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statsRow}>
          <LeaveStat label="Used" value="11" />
          <LeaveStat label="Balance" value="14" />
        </View>

        <Text style={styles.sectionTitle}>History</Text>
        {requests.map((req, index) => (
          <View key={index} style={[globalStyles.glassCard, {marginBottom: 12}]}>
            <View style={styles.reqHeader}>
              <Text style={styles.reqType}>{req.type}</Text>
              <View style={[styles.statusBadge, {backgroundColor: req.color + '20'}]}>
                <Text style={[styles.statusText, {color: req.color}]}>{req.status}</Text>
              </View>
            </View>
            <Text style={styles.reqRange}>{req.range}</Text>
            <Text style={styles.reqDays}>{req.days} Days Total</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const LeaveStat = ({label, value}: {label: string, value: string}) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: {padding: 24},
  statsRow: {flexDirection: 'row', gap: 16, marginBottom: 24},
  statBox: {
    flex: 1,
    backgroundColor: COLORS.bgMid,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  statValue: {fontSize: 24, fontWeight: '700', color: COLORS.white},
  statText: {fontSize: 12, color: COLORS.textSecondary, marginTop: 4},
  sectionTitle: {fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 16},
  reqHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'},
  reqType: {fontSize: 16, fontWeight: '600', color: COLORS.white},
  statusBadge: {paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8},
  statusText: {fontSize: 12, fontWeight: '700'},
  reqRange: {fontSize: 14, color: COLORS.textSecondary, marginTop: 8},
  reqDays: {fontSize: 12, color: COLORS.textMuted, marginTop: 4},
});
