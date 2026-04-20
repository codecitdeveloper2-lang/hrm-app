import { useTheme } from '../../styles/ThemeProvider';
import React, { useState } from 'react';
import {
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  useWindowDimensions, 
  TextInput,
  Alert
} from 'react-native';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { apiSlice } from '../../store/api/apiSlice';
import StatCard from '../../components/dashboard/StatCard';

export default function ProfilePage() {
  const { colors: THEME_COLORS } = useTheme();
  const styles = _getStyles(THEME_COLORS);
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isResponsive = width < 1024;

  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    personal: {
      name: 'John Doe',
      role: 'Software Developer',
      dept: 'IT',
      email: 'souravghoshmgu1@gmail.com',
      phone: '9000000001',
      dob: 'August 20, 1998',
      status: 'Active',
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
  });

  const handleLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
  };

  const handleSave = () => {
    setIsEditing(false);
    Alert.alert("Success", "Profile updated successfully!");
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  const updateField = (category: keyof typeof profileData, field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const PROFILE_STATS = [
    { title: 'Days Present', value: '22', accentColor: THEME_COLORS.success, icon: '⏱️' },
    { title: 'Leave Taken', value: '5', accentColor: THEME_COLORS.warning, icon: '📅' },
    { title: 'Overtime Hours', value: '12h', accentColor: '#8B5CF6', icon: '⏲️' },
    { title: 'Performance', value: 'A+', accentColor: THEME_COLORS.info, icon: '📈' },
  ];

  const InfoSection = ({title, children}: {title: string, children: React.ReactNode}) => (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const InfoRow = ({
    label, 
    value, 
    isLast, 
    isEditing, 
    onChangeText
  }: {
    label: string, 
    value: string, 
    isLast?: boolean,
    isEditing?: boolean,
    onChangeText?: (text: string) => void
  }) => (
    <View>
      <View style={styles.infoRow}>
        <View style={styles.labelCol}>
          <Text style={styles.infoLabelIcon}>{getIconForLabel(label)}</Text>
          <Text style={styles.infoLabelText}>{label}</Text>
        </View>
        {isEditing ? (
          <TextInput
            style={styles.editableValue}
            value={value}
            onChangeText={onChangeText}
            placeholder={`Enter ${label}`}
            placeholderTextColor={THEME_COLORS.textMuted}
          />
        ) : (
          <Text style={styles.infoValueText}>{value}</Text>
        )}
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

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      
      {/* Header with Title and Edit Button */}
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <TouchableOpacity 
          style={[styles.editBtn, isEditing && styles.saveBtn]} 
          onPress={handleToggleEdit}
        >
          <Text style={styles.editBtnIcon}>{isEditing ? '✓' : '✎'}</Text>
          <Text style={styles.editBtnText}>{isEditing ? 'Save Profile' : 'Edit Profile'}</Text>
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
              {isEditing ? (
                <TextInput
                  style={styles.heroNameInput}
                  value={profileData.personal.name}
                  onChangeText={(val) => updateField('personal', 'name', val)}
                />
              ) : (
                <Text style={styles.heroName}>{profileData.personal.name}</Text>
              )}
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{profileData.personal.status}</Text>
              </View>
            </View>
            <Text style={styles.heroRole}>{profileData.personal.role}</Text>
            <Text style={styles.heroDept}>{profileData.personal.dept}</Text>
            
            <View style={styles.heroContactRow}>
              <View style={styles.heroContactItem}>
                <Text style={styles.contactIcon}>✉</Text>
                <Text style={styles.contactText}>{profileData.personal.email}</Text>
              </View>
              <View style={styles.heroContactItem}>
                <Text style={styles.contactIcon}>📞</Text>
                <Text style={styles.contactText}>{profileData.personal.phone}</Text>
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
        <View style={styles.infoColumn}>
          <InfoSection title="Personal Information">
            <InfoRow 
              label="Full Name" 
              value={profileData.personal.name} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('personal', 'name', text)}
            />
            <InfoRow 
              label="Email" 
              value={profileData.personal.email} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('personal', 'email', text)}
            />
            <InfoRow 
              label="Phone" 
              value={profileData.personal.phone} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('personal', 'phone', text)}
            />
            <InfoRow 
              label="Date of Birth" 
              value={profileData.personal.dob} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('personal', 'dob', text)}
              isLast 
            />
          </InfoSection>

          <View style={styles.spacer} />

          <InfoSection title="Address Details">
            <InfoRow 
              label="Street" 
              value={profileData.address.street} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('address', 'street', text)}
            />
            <InfoRow 
              label="City & State" 
              value={profileData.address.cityState} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('address', 'cityState', text)}
            />
            <InfoRow 
              label="Country" 
              value={profileData.address.country} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('address', 'country', text)}
            />
            <InfoRow 
              label="Zip Code" 
              value={profileData.address.zip} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('address', 'zip', text)}
              isLast 
            />
          </InfoSection>
        </View>

        <View style={styles.infoColumn}>
          <InfoSection title="Employment Details">
            <InfoRow 
              label="Designation" 
              value={profileData.employment.designation} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('employment', 'designation', text)}
            />
            <InfoRow 
              label="Department" 
              value={profileData.employment.department} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('employment', 'department', text)}
            />
            <InfoRow 
              label="Role" 
              value={profileData.employment.role} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('employment', 'role', text)}
            />
            <InfoRow 
              label="Join Date" 
              value={profileData.employment.joinDate} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('employment', 'joinDate', text)}
            />
            <InfoRow 
              label="Employee ID" 
              value={profileData.employment.id} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('employment', 'id', text)}
              isLast 
            />
          </InfoSection>

          <View style={styles.spacer} />

          <InfoSection title="Emergency Contact">
            <InfoRow 
              label="Name" 
              value={profileData.emergency.name} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('emergency', 'name', text)}
            />
            <InfoRow 
              label="Relationship" 
              value={profileData.emergency.relationship} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('emergency', 'relationship', text)}
            />
            <InfoRow 
              label="Phone" 
              value={profileData.emergency.phone} 
              isEditing={isEditing}
              onChangeText={(text) => updateField('emergency', 'phone', text)}
              isLast 
            />
          </InfoSection>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.logoutBtn} 
        onPress={handleLogout}>
        <Text style={styles.logoutText}>Sign Out of System</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const _getStyles = (COLORS: any) => StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  saveBtn: { backgroundColor: COLORS.success },
  editBtnIcon: { color: '#FFFFFF', fontSize: 14 },
  editBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  heroCard: {
    backgroundColor: COLORS.accent,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: COLORS.accent,
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
  avatarText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  cameraBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.white,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  cameraIcon: { fontSize: 10 },
  heroMainInfo: { flex: 1 },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  heroName: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 },
  heroNameInput: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
    padding: 0,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: { fontSize: 9, fontWeight: '800', color: '#34D399', textTransform: 'uppercase' },
  heroRole: { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },
  heroDept: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500' },
  heroContactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  heroContactItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactIcon: { fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  contactText: { fontSize: 12, color: '#FFFFFF', fontWeight: '500' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginHorizontal: -6,
    marginBottom: 12,
  },
  infoGrid: { flexDirection: 'row', gap: 24 },
  columnLayout: { flexDirection: 'column' },
  infoColumn: { flex: 1 },
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    borderColor: COLORS.cardBorder,
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
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  sectionContent: { gap: 0 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  labelCol: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoLabelIcon: { fontSize: 14, color: COLORS.textSecondary, width: 20, textAlign: 'center' },
  infoLabelText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '600' },
  infoValueText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '700' },
  editableValue: {
    fontSize: 14,
    color: COLORS.accent,
    fontWeight: '700',
    textAlign: 'right',
    padding: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    minWidth: 120,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 12,
  },
  spacer: { height: 24 },
  logoutBtn: {
    marginTop: 40,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  logoutText: { color: COLORS.error, fontSize: 15, fontWeight: '700' },
});
