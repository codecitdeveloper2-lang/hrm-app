import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {COLORS, globalStyles} from '../../styles';
import Header from '../../components/layout/Header';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';

export default function AttendancePage() {
  const columns = [
    {key: 'date', title: 'Date', width: 100},
    {key: 'checkIn', title: 'Check In', width: 90},
    {key: 'checkOut', title: 'Check Out', width: 90},
    {key: 'status', title: 'Status', width: 90},
  ];

  const data = [
    {date: '25 Mar', checkIn: '09:00 AM', checkOut: '06:05 PM', status: 'Present'},
    {date: '24 Mar', checkIn: '08:55 AM', checkOut: '06:10 PM', status: 'Present'},
    {date: '23 Mar', checkIn: '09:15 AM', checkOut: '06:00 PM', status: 'Late'},
    {date: '22 Mar', checkIn: '-', checkOut: '-', status: 'Absent'},
    {date: '21 Mar', checkIn: '08:45 AM', checkOut: '05:50 PM', status: 'Present'},
  ];

  return (
    <View style={globalStyles.screenContainer}>
      <Header 
        title="Attendance" 
        subtitle="Your daily check-in and out logs"
        rightAction={<Button title="Export PDF" variant="secondary" size="sm" onPress={() => {}} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryRow}>
          <SummaryCard label="On Time" value="18" color="#4ECDC4" />
          <SummaryCard label="Late" value="2" color="#FFE66D" />
          <SummaryCard label="Absent" value="1" color="#FF6B6B" />
        </View>

        <View style={globalStyles.glassCard}>
          <Text style={styles.tableTitle}>Monthly Log - March</Text>
          <Table columns={columns} data={data} />
        </View>
      </ScrollView>
    </View>
  );
}

const SummaryCard = ({label, value, color}: {label: string, value: string, color: string}) => (
  <View style={[styles.summaryCard, {borderColor: color + '30'}]}>
    <Text style={[styles.summaryValue, {color}]}>{value}</Text>
    <Text style={styles.summaryLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  content: {padding: 24},
  summaryRow: {flexDirection: 'row', gap: 12, marginBottom: 24},
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.bgMid,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  summaryValue: {fontSize: 20, fontWeight: '700'},
  summaryLabel: {fontSize: 12, color: COLORS.textSecondary, marginTop: 4},
  tableTitle: {fontSize: 16, fontWeight: '600', color: COLORS.white, marginBottom: 16},
});
