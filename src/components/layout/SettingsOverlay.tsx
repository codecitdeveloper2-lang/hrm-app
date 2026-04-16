import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, Dimensions, useWindowDimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES, globalStyles } from '../../styles';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SettingsOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

interface SettingItemProps {
  icon: string;
  title: string;
  subtitle: string;
  type: 'toggle' | 'input' | 'custom' | 'button';
  value?: boolean | string;
  onValueChange?: (val: any) => void;
  children?: React.ReactNode;
}

const SettingItem = ({ icon, title, subtitle, type, value, onValueChange, children }: SettingItemProps) => (
  <View style={styles.itemContainer}>
    <View style={styles.itemLeft}>
      <View style={styles.itemIconContainer}>
        <Text style={styles.itemIcon}>{icon}</Text>
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        <Text style={styles.itemSubtitle}>{subtitle}</Text>
      </View>
    </View>
    <View style={styles.itemRight}>
      {type === 'toggle' && (
        <Switch
          value={value as boolean}
          onValueChange={onValueChange}
          trackColor={{ false: '#3E3E3E', true: COLORS.accent }}
          thumbColor={value ? COLORS.white : '#f4f3f4'}
        />
      )}
      {type === 'custom' && children}
    </View>
  </View>
);

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingSection = ({ title, children }: SettingSectionProps) => (
  <View style={styles.sectionCard}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

export default function SettingsOverlay({ isVisible, onClose }: SettingsOverlayProps) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1024;
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    sound: true
  });

  const [appearance, setAppearance] = useState({
    darkMode: false,
    compactMode: false,
    accentColor: '#4285F4'
  });

  const [security, setSecurity] = useState({
    twoFactor: false
  });

  const colors = ['#4285F4', '#9333EA', '#EF4444', '#22C55E', '#F59E0B', '#06B6D4'];

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>
        
        <View style={[styles.modalContent, isLargeScreen && { width: '80%', maxWidth: 1000 }]}>
          {/* Top Header */}
          <View style={styles.topHeader}>
            <View>
              <Text style={styles.headerTitle}>settings</Text>
              <Text style={styles.headerSubtitle}>manage_preferences</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity style={styles.saveButton}>
                <Text style={styles.saveButtonText}>☁️ all_saved</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={[styles.grid, isLargeScreen && styles.gridRow]}>
              {/* Left Column / Top Section */}
              <View style={[styles.gridColumn, isLargeScreen && { marginRight: 20 }]}>
                <SettingSection title="notifications">
                  <SettingItem 
                    icon="✉️" 
                    title="Email Notifications" 
                    subtitle="Receive notifications via email" 
                    type="toggle" 
                    value={notifications.email}
                    onValueChange={(val) => setNotifications({...notifications, email: val})}
                  />
                  <SettingItem 
                    icon="🔔" 
                    title="Push Notifications" 
                    subtitle="Receive push notifications in browser" 
                    type="toggle" 
                    value={notifications.push}
                    onValueChange={(val) => setNotifications({...notifications, push: val})}
                  />
                  <SettingItem 
                    icon="📱" 
                    title="SMS Notifications" 
                    subtitle="Receive SMS for important alerts" 
                    type="toggle" 
                    value={notifications.sms}
                    onValueChange={(val) => setNotifications({...notifications, sms: val})}
                  />
                  <SettingItem 
                    icon="🔊" 
                    title="Sound Effects" 
                    subtitle="Play sounds for notifications" 
                    type="toggle" 
                    value={notifications.sound}
                    onValueChange={(val) => setNotifications({...notifications, sound: val})}
                  />
                </SettingSection>

                <SettingSection title="security">
                  <SettingItem 
                    icon="🛡️" 
                    title="Two-Factor Authentication" 
                    subtitle="Add an extra layer of security" 
                    type="toggle" 
                    value={security.twoFactor}
                    onValueChange={(val) => setSecurity({...security, twoFactor: val})}
                  />
                  
                  <View style={styles.passwordSection}>
                    <View style={styles.itemLeft}>
                      <View style={styles.itemIconContainer}>
                        <Text style={styles.itemIcon}>🔐</Text>
                      </View>
                      <View style={styles.itemTextContainer}>
                        <Text style={styles.itemTitle}>Change Password</Text>
                        <Text style={styles.itemSubtitle}>Update your account password</Text>
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <TextInput 
                        style={styles.input} 
                        placeholder="Current Password" 
                        placeholderTextColor={COLORS.textMuted}
                        secureTextEntry 
                      />
                      <TextInput 
                        style={styles.input} 
                        placeholder="New Password (min 8 characters)" 
                        placeholderTextColor={COLORS.textMuted}
                        secureTextEntry 
                      />
                      <TextInput 
                        style={styles.input} 
                        placeholder="Confirm New Password" 
                        placeholderTextColor={COLORS.textMuted}
                        secureTextEntry 
                      />
                      <TouchableOpacity style={styles.updateButton}>
                        <Text style={styles.updateButtonText}>Update Password</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </SettingSection>
              </View>

              {/* Right Column / Bottom Section */}
              <View style={styles.gridColumn}>
                <SettingSection title="appearance">
                  <SettingItem 
                    icon="☀️" 
                    title="dark_mode" 
                    subtitle="Switch to dark theme" 
                    type="toggle" 
                    value={appearance.darkMode}
                    onValueChange={(val) => setAppearance({...appearance, darkMode: val})}
                  />
                  <SettingItem 
                    icon="🖥️" 
                    title="Compact Mode" 
                    subtitle="Reduce spacing and padding" 
                    type="toggle" 
                    value={appearance.compactMode}
                    onValueChange={(val) => setAppearance({...appearance, compactMode: val})}
                  />
                  <SettingItem 
                    icon="🎨" 
                    title="accent_color" 
                    subtitle="Choose your preferred accent color" 
                    type="custom"
                  >
                    <View style={styles.colorPicker}>
                      {colors.map(color => (
                        <TouchableOpacity 
                          key={color} 
                          style={[
                            styles.colorCircle, 
                            { backgroundColor: color },
                            appearance.accentColor === color && styles.colorCircleActive
                          ]} 
                          onPress={() => setAppearance({...appearance, accentColor: color})}
                        />
                      ))}
                    </View>
                  </SettingItem>
                  
                  <View style={styles.languageContainer}>
                     <View style={styles.itemLeft}>
                      <View style={styles.itemIconContainer}>
                        <Text style={styles.itemIcon}>🌐</Text>
                      </View>
                      <View style={styles.itemTextContainer}>
                        <Text style={styles.itemTitle}>Language</Text>
                        <Text style={styles.itemSubtitle}>Select your preferred language</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.dropdown}>
                      <Text style={styles.dropdownText}>English (US)</Text>
                      <Text style={styles.dropdownArrow}>▾</Text>
                    </TouchableOpacity>
                  </View>
                </SettingSection>

                <SettingSection title="privacy_data">
                   <View style={styles.infoBox}>
                     <Text style={styles.infoText}>ℹ️ Your data is securely stored and protected according to our privacy policy.</Text>
                   </View>

                   <View style={styles.dataItem}>
                      <Text style={styles.dataTitle}>Data Export</Text>
                      <Text style={styles.dataSubtitle}>Download a copy of your data including attendance records, leave history, and profile information.</Text>
                      <TouchableOpacity style={styles.borderButton}>
                        <Text style={styles.borderButtonText}>📥 Request Data Export</Text>
                      </TouchableOpacity>
                   </View>

                   <View style={styles.dataItem}>
                      <Text style={styles.dataTitle}>Connected Devices</Text>
                      <Text style={styles.dataSubtitle}>Manage devices that are currently logged into your account.</Text>
                      <View style={styles.deviceItem}>
                         <View style={styles.itemLeft}>
                          <View style={styles.itemIconContainer}>
                            <Text style={styles.itemIcon}>💻</Text>
                          </View>
                          <View style={styles.itemTextContainer}>
                            <Text style={styles.itemTitle}>Windows PC - Chrome</Text>
                            <Text style={styles.itemSubtitle}>Current session • Active now</Text>
                          </View>
                        </View>
                        <View style={styles.activeBadge}>
                          <Text style={styles.activeBadgeText}>Active</Text>
                        </View>
                      </View>
                   </View>

                   <View style={styles.dangerZone}>
                      <Text style={styles.dangerTitle}>Danger Zone</Text>
                      <Text style={styles.dangerSubtitle}>Permanently delete your account and all associated data. This action cannot be undone.</Text>
                      <TouchableOpacity style={styles.deleteButton}>
                        <Text style={styles.deleteButtonText}>🗑️ Delete Account</Text>
                      </TouchableOpacity>
                   </View>
                </SettingSection>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    width: '94%',
    height: '85%',
    backgroundColor: COLORS.bgDark,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 24,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: 'rgba(66, 133, 244, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(66, 133, 244, 0.3)',
    marginRight: 10,
  },
  saveButtonText: {
    color: '#4285F4',
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: COLORS.white,
    fontSize: 18,
  },
  grid: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
  },
  gridColumn: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  sectionContent: {},
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemIcon: {
    fontSize: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  itemSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemRight: {
    marginLeft: 10,
  },
  colorPicker: {
    flexDirection: 'row',
    marginTop: 4,
  },
  colorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleActive: {
    borderColor: COLORS.white,
    transform: [{ scale: 1.1 }],
  },
  passwordSection: {
    paddingVertical: 16,
  },
  inputGroup: {
    marginTop: 16,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: COLORS.white,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  updateButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.accent,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  updateButtonText: {
    color: COLORS.accent,
    fontWeight: '600',
    fontSize: 14,
  },
  languageContainer: {
    paddingVertical: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  dropdownArrow: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  infoBox: {
    backgroundColor: 'rgba(66, 133, 244, 0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(66, 133, 244, 0.1)',
  },
  infoText: {
    color: '#4285F4',
    fontSize: 12,
    lineHeight: 18,
  },
  dataItem: {
    marginBottom: 20,
  },
  dataTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  dataSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 18,
  },
  borderButton: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  borderButtonText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBadgeText: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '700',
  },
  dangerZone: {
    marginTop: 10,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
  dangerSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  deleteButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
});
