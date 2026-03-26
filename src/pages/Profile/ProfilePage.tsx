import React from 'react';
import {View, Text, StyleSheet, Image, ScrollView, TouchableOpacity} from 'react-native';
import {COLORS, globalStyles} from '../../styles';
import Header from '../../components/layout/Header';
import Button from '../../components/common/Button';

export default function ProfilePage({onLogout}: {onLogout?: () => void}) {
  const user = {
    name: 'John Doe',
    email: 'john.doe@crewstack.com',
    role: 'Senior Project Manager',
    dept: 'Engineering',
    joined: 'Jan 15, 2024',
    phone: '+1 234 567 890',
  };

  return (
    <View style={globalStyles.screenContainer}>
      <Header title="My Profile" subtitle="Manage your account settings" />
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info Card */}
        <View style={globalStyles.glassCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>👨‍💻</Text>
            </View>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userRole}>{user.role}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Active Now</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoItem label="Email" value={user.email} />
            <InfoItem label="Department" value={user.dept} />
            <InfoItem label="Phone" value={user.phone} />
            <InfoItem label="Joined" value={user.joined} />
          </View>
        </View>

        {/* Settings Links */}
        <View style={styles.settingsSection}>
          <SettingItem label="Change Password" icon="🔒" />
          <SettingItem label="Notification Settings" icon="🔔" />
          <SettingItem label="Privacy & Security" icon="🛡️" />
          
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const InfoItem = ({label, value}: {label: string, value: string}) => (
  <View style={styles.infoItem}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const SettingItem = ({label, icon}: {label: string, icon: string}) => (
  <TouchableOpacity style={styles.settingItem} activeOpacity={0.7}>
    <View style={styles.settingLeft}>
      <View style={styles.settingIconBg}>
        <Text style={styles.settingEmoji}>{icon}</Text>
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
    </View>
    <Text style={styles.chevron}>→</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  content: {padding: 24},
  avatarSection: {alignItems: 'center', marginBottom: 28},
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.accent,
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarEmoji: {fontSize: 48},
  userName: {fontSize: 24, fontWeight: '700', color: COLORS.white},
  userRole: {fontSize: 14, color: COLORS.textSecondary, marginTop: 4},
  badge: {
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 99,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.success + '40',
  },
  badgeText: {fontSize: 12, color: COLORS.success, fontWeight: '600'},
  infoGrid: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 10},
  infoItem: {width: '50%', marginBottom: 20},
  infoLabel: {fontSize: 12, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 1},
  infoValue: {fontSize: 14, color: COLORS.textPrimary, marginTop: 4, fontWeight: '500'},
  
  settingsSection: {marginTop: 32, gap: 12},
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.bgMid,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  settingLeft: {flexDirection: 'row', alignItems: 'center'},
  settingIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingEmoji: {fontSize: 18},
  settingLabel: {fontSize: 15, color: COLORS.white, fontWeight: '500'},
  chevron: {fontSize: 18, color: COLORS.textMuted, fontWeight: '600'},
  
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  logoutIcon: {fontSize: 18, marginRight: 12},
  logoutText: {fontSize: 16, color: COLORS.error, fontWeight: '700'},
});
