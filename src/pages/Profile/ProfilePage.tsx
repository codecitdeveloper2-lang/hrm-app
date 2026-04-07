import React from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform} from 'react-native';
import {COLORS} from '../../styles';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { apiSlice } from '../../store/api/apiSlice';
import StatCard from '../../components/dashboard/StatCard';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isResponsive = width < 1024;

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
  };

  const employeeData = {
    personal: {
      name: 'John Doe',
      status: 'Active',
      role: 'Software Developer',
      dept: 'IT',
      email: 'souravghoshmgu1@gmail.com',
      phone: '9000000001',
      dob: 'August 20, 1998',
    },
    employment: {
      designation: 'Software Developer',
      department: 'IT',
      role: 'H+',
      joinDate: 'June 1, 2023',
      id: 'EMP - EMP002',
    },
    address: {
      street: 'Park Street',
      cityState: 'Kolkata, West Bengal',
      country: 'India',
      zip: '700016',
    },
    emergency: {
      name: 'Jane Doe',
      relationship: 'Mother',
      phone: '8888888888',
    }
  };

  const PROFILE_STATS = [
    { title: 'Days Present', value: '22', accentColor: '#10B981', icon: '⏱️' },
    { title: 'Leave Taken', value: '5', accentColor: '#F59E0B', icon: '📅' },
    { title: 'Overtime Hours', value: '12h', accentColor: '#8B5CF6', icon: '⏲️' },
    { title: 'Performance', value: 'A+', accentColor: '#3B82F6', icon: '📈' },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      
      {/* Header with Title and Edit Button */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnIcon}>✎</Text>
          <Text style={styles.editBtnText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroLeft}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>JD</Text>
            <View style={styles.cameraBadge}>
              <Text style={styles.cameraIcon}>📸</Text>
            </View>
          </View>
          <View style={styles.heroMainInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.heroName}>{employeeData.personal.name}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{employeeData.personal.status}</Text>
              </View>
            </View>
            <Text style={styles.heroRole}>{employeeData.personal.role}</Text>
            <Text style={styles.heroDept}>{employeeData.personal.dept}</Text>
            
            <View style={styles.heroContactRow}>
              <View style={styles.heroContactItem}>
                <Text style={styles.contactIcon}>✉</Text>
                <Text style={styles.contactText}>{employeeData.personal.email}</Text>
              </View>
              <View style={styles.heroContactItem}>
                <Text style={styles.contactIcon}>📞</Text>
                <Text style={styles.contactText}>{employeeData.personal.phone}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        {PROFILE_STATS.map((stat, index) => (
          <View key={index} style={{ width: isMobile ? '100%' : isResponsive ? '48%' : '24%', minWidth: 140 }}>
            <StatCard {...stat} />
          </View>
        ))}
      </View>

      {/* Info Sections Grid */}
      <View style={[styles.infoGrid, isResponsive && styles.columnLayout]}>
        {/* Left Column */}
        <View style={styles.infoColumn}>
          <InfoSection title="Personal Information">
            <InfoRow label="Full Name" value={employeeData.personal.name} />
            <InfoRow label="Email" value={employeeData.personal.email} />
            <InfoRow label="Phone" value={employeeData.personal.phone} />
            <InfoRow label="Date of Birth" value={employeeData.personal.dob} isLast />
          </InfoSection>

          <View style={styles.spacer} />

          <InfoSection title="Address Details">
            <InfoRow label="Street" value={employeeData.address.street} />
            <InfoRow label="City & State" value={employeeData.address.cityState} />
            <InfoRow label="Country" value={employeeData.address.country} />
            <InfoRow label="Zip Code" value={employeeData.address.zip} isLast />
          </InfoSection>
        </View>

        {/* Right Column */}
        <View style={styles.infoColumn}>
          <InfoSection title="Employment Details">
            <InfoRow label="Designation" value={employeeData.employment.designation} />
            <InfoRow label="Department" value={employeeData.employment.department} />
            <InfoRow label="Role" value={employeeData.employment.role} />
            <InfoRow label="Join Date" value={employeeData.employment.joinDate} />
            <InfoRow label="Employee ID" value={employeeData.employment.id} isLast />
          </InfoSection>

          <View style={styles.spacer} />

          <InfoSection title="Emergency Contact">
            <InfoRow label="Name" value={employeeData.emergency.name} />
            <InfoRow label="Relationship" value={employeeData.emergency.relationship} />
            <InfoRow label="Phone" value={employeeData.emergency.phone} isLast />
          </InfoSection>
        </View>
      </View>

      {/* Logout Action */}
      <TouchableOpacity 
        style={styles.logoutBtn} 
        activeOpacity={0.8}
        onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out of System</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const InfoSection = ({title, children}: {title: string, children: React.ReactNode}) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const InfoRow = ({label, value, isLast}: {label: string, value: string, isLast?: boolean}) => (
  <View>
    <View style={styles.infoRow}>
      <View style={styles.labelCol}>
        <Text style={styles.infoLabelIcon}>{getIconForLabel(label)}</Text>
        <Text style={styles.infoLabelText}>{label}</Text>
      </View>
      <Text style={styles.infoValueText}>{value}</Text>
    </View>
    {!isLast && <View style={styles.divider} />}
  </View>
);

const getIconForLabel = (label: string) => {
  const icons: Record<string, string> = {
    'Full Name': '👤', 'Email': '✉', 'Phone': '📞', 'Date of Birth': '📅',
    'Designation': '🏢', 'Department': '📁', 'Role': '👤', 'Join Date': '📅', 'Employee ID': '🆔',
    'Street': '📍', 'City & State': '🏢', 'Country': '🌍', 'Zip Code': '🔢',
    'Name': '👤', 'Relationship': '👥'
  };
  return icons[label] || '•';
};

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
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  editBtnIcon: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  heroCard: {
    backgroundColor: '#1D4ED8',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#1D4ED8',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#A855F7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#F8FAFC',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1D4ED8',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cameraIcon: {
    fontSize: 10,
  },
  heroMainInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    textTransform: 'uppercase',
  },
  heroRole: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  heroDept: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    marginTop: 0,
  },
  heroContactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  heroContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactIcon: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
  },
  contactText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 24,
  },
  columnLayout: {
    flexDirection: 'column',
  },
  infoColumn: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    borderColor: '#F1F5F9',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 20,
  },
  sectionContent: {
    gap: 0,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoLabelIcon: {
    fontSize: 14,
    color: '#94A3B8',
    width: 20,
    textAlign: 'center',
  },
  infoLabelText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  infoValueText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  spacer: {
    height: 24,
  },
  logoutBtn: {
    marginTop: 40,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  },
});
