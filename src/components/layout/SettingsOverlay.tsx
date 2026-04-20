import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, TextInput, Dimensions, useWindowDimensions, Modal, TouchableWithoutFeedback } from 'react-native';
import { BORDER_RADIUS, SPACING, FONT_SIZES, globalStyles } from '../../styles';
import { useTheme } from '../../styles/ThemeProvider';

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

const SettingItem = ({ icon, title, subtitle, type, value, onValueChange, children }: SettingItemProps) => {
  const { colors: THEME_COLORS } = useTheme();
  const styles = getStyles(THEME_COLORS);
  
  return (
    <View style={[styles.itemContainer, type === 'custom' && { flexDirection: 'column', alignItems: 'flex-start' }]}>
      <View style={[styles.itemLeft, type === 'custom' && { width: '100%', marginBottom: 12 }]}>
        <View style={styles.itemIconContainer}>
          <Text style={styles.itemIcon}>{icon}</Text>
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.itemSubtitle}>{subtitle}</Text>
        </View>
      </View>
      {type === 'toggle' && (
        <View style={styles.itemRight}>
          <Switch
            value={value as boolean}
            onValueChange={onValueChange}
            trackColor={{ false: '#3E3E3E', true: THEME_COLORS.accent }}
            thumbColor={value ? THEME_COLORS.white : '#f4f3f4'}
          />
        </View>
      )}
      {type === 'custom' && (
        <View style={[styles.itemRight, { marginLeft: 0, width: '100%' }]}>
          {children}
        </View>
      )}
    </View>
  );
};

interface SettingSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingSection = ({ title, children }: SettingSectionProps) => {
  const { colors: THEME_COLORS } = useTheme();
  const styles = getStyles(THEME_COLORS);
  return (
    <View style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
};

export default function SettingsOverlay({ isVisible, onClose }: SettingsOverlayProps) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1024;
  
  const { colors: themeColors, isDarkMode, toggleTheme } = useTheme();
  const styles = getStyles(themeColors);

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    sound: true
  });

  const [appearance, setAppearance] = useState({
    compactMode: false,
    accentColor: '#4285F4'
  });

  const [security, setSecurity] = useState({
    twoFactor: false
  });

  const [language, setLanguage] = useState('English (US)');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const colors = ['#4285F4', '#9333EA', '#EF4444', '#22C55E', '#F59E0B', '#06B6D4'];
  const LANGUAGES = ['English (US)', 'English (UK)', 'Español', 'Français', 'Deutsch', 'हिंदी'];

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
              <Text style={styles.headerTitle}>Settings</Text>
              <Text style={styles.headerSubtitle}>Manage your preferences</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>✓ Saved</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
            <View style={[styles.grid, isLargeScreen && styles.gridRow]}>
              {/* Left Column / Top Section */}
              <View style={[styles.gridColumn, isLargeScreen && { marginRight: 20 }]}>
                <SettingSection title="Notifications">
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

                <SettingSection title="Security">
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
                        placeholderTextColor={themeColors.textMuted}
                        secureTextEntry 
                      />
                      <TextInput 
                        style={styles.input} 
                        placeholder="New Password (min 8 characters)" 
                        placeholderTextColor={themeColors.textMuted}
                        secureTextEntry 
                      />
                      <TextInput 
                        style={styles.input} 
                        placeholder="Confirm New Password" 
                        placeholderTextColor={themeColors.textMuted}
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
                <SettingSection title="Appearance">
                  <SettingItem 
                    icon="☀️" 
                    title="Dark Mode" 
                    subtitle="Switch to dark theme" 
                    type="toggle" 
                    value={isDarkMode}
                    onValueChange={toggleTheme}
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
                    title="Accent Color" 
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
                    <TouchableOpacity 
                      style={[styles.dropdown, showLangDropdown && styles.dropdownOpen]}
                      onPress={() => setShowLangDropdown(!showLangDropdown)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.dropdownText}>{language}</Text>
                      <Text style={styles.dropdownArrow}>{showLangDropdown ? '▴' : '▾'}</Text>
                    </TouchableOpacity>
                    {showLangDropdown && (
                      <View style={styles.dropdownList}>
                        {LANGUAGES.map((lang) => (
                          <TouchableOpacity 
                            key={lang} 
                            style={[
                              styles.dropdownItem,
                              language === lang && styles.dropdownItemSelected
                            ]}
                            onPress={() => {
                              setLanguage(lang);
                              setShowLangDropdown(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text style={[
                              styles.dropdownItemText,
                              language === lang && styles.dropdownItemTextSelected
                            ]}>
                              {lang}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </SettingSection>

                <SettingSection title="Privacy & Data">
                   <View style={styles.infoBox}>
                     <Text style={styles.infoText}>ℹ️ Your data is securely stored and protected according to our privacy policy.</Text>
                   </View>

                   <View style={styles.dataItem}>
                      <Text style={styles.dataTitle}>Data Export</Text>
                      <Text style={styles.dataSubtitle}>Download a copy of your data including attendance records, leave history, and profile information.</Text>
                      <TouchableOpacity style={styles.exportButton} activeOpacity={0.8}>
                        <Text style={styles.exportButtonText}>Request Data Export</Text>
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
                      <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8}>
                        <Text style={styles.deleteButtonText}>Delete Account</Text>
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

const getStyles = (COLORS: any) => StyleSheet.create({
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
    width: '96%',
    height: '88%',
    backgroundColor: COLORS.bgDark,
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
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
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  saveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginRight: 12,
  },
  saveBadgeText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.bgMid,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  closeButtonText: {
    color: COLORS.textPrimary,
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
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  sectionContent: {},
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accentGlow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
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
    borderColor: COLORS.accent,
    transform: [{ scale: 1.1 }],
  },
  passwordSection: {
    paddingVertical: 16,
  },
  inputGroup: {
    marginTop: 16,
  },
  input: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: COLORS.textPrimary,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    fontSize: 15,
  },
  updateButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 15,
  },
  languageContainer: {
    paddingVertical: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  dropdownOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  dropdownText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  dropdownArrow: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  dropdownList: {
    backgroundColor: COLORS.bgMid,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: COLORS.bgMid,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.accent,
  },
  dropdownItemText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  dropdownItemTextSelected: {
    color: COLORS.white,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: COLORS.accentGlow,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  infoText: {
    color: COLORS.accent,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
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
  exportButton: {
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.bgMid,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  exportButtonText: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.bgMid,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  activeBadge: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.25)',
  },
  activeBadgeText: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dangerZone: {
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },
  dangerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  dangerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
});
