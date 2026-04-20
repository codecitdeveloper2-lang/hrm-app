import { useTheme } from '../../styles/ThemeProvider';
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {COLORS, globalStyles} from '../../styles';
import Header from '../../components/layout/Header';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';

export default function UsersPage() {
  const { colors: THEME_COLORS } = useTheme();
  const styles = _getStyles(THEME_COLORS);
  const [activeTab, setActiveTab] = useState('All');

  const columns = [
    {key: 'name', title: 'Name', width: 140},
    {key: 'role', title: 'Role', width: 100},
    {key: 'dept', title: 'Dept', width: 100},
    {key: 'status', title: 'Status', width: 80},
  ];

  const data = [
    {id: '1', name: 'Alex Johnson', role: 'Dev', dept: 'Eng', status: 'Online'},
    {id: '2', name: 'Sam Smith', role: 'Mgr', dept: 'Sales', status: 'Away'},
    {id: '3', name: 'Mike Ross', role: 'Dev', dept: 'Eng', status: 'Offline'},
    {id: '4', name: 'Jane Doe', role: 'Des', dept: 'UX', status: 'Online'},
    {id: '5', name: 'Chris Evans', role: 'Dev', dept: 'Eng', status: 'Online'},
  ];

  return (
    <View style={globalStyles.screenContainer}>
      <Header 
        title="Users" 
        subtitle="Manage regular employee and admin accounts"
        rightAction={<Button title="Add User" size="sm" onPress={() => {}} />} 
      />
      
      <View style={styles.container}>
        {/* Tabs */}
        <View style={styles.tabContainer}>
          {['All', 'Admins', 'Employees'].map(tab => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={globalStyles.glassCard}>
          <Table 
            columns={columns} 
            data={data}
          />
        </View>
      </View>
    </View>
  );
}

const _getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    padding: 24,
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: COLORS.bgMid,
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  tabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});
