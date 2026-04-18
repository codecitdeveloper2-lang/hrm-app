import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, BORDER_RADIUS, SPACING, FONT_SIZES } from '../../styles';
import SettingsOverlay from './SettingsOverlay';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { apiSlice } from '../../store/api/apiSlice';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  showMenuButton?: boolean;
}

export default function Header({ title, subtitle, onMenuPress, onProfilePress, showMenuButton }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    setShowDropdown(false);
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
  };

  const toggleDropdown = () => setShowDropdown(!showDropdown);

  const handleSettingsPress = () => {
    setShowDropdown(false);
    setShowSettings(true);
  };

  const handleProfilePress = () => {
    setShowDropdown(false);
    if (onProfilePress) {
      onProfilePress();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showMenuButton && (
          <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        )}
        <View>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>

      <TouchableOpacity style={styles.userProfile} onPress={toggleDropdown}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>John Doe</Text>
          <Text style={styles.userRole}>souravghoshmgu1</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>JD</Text>
        </View>
        <Text style={styles.chevron}>{showDropdown ? '▴' : '▾'}</Text>
      </TouchableOpacity>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}>
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.modalOverlay}>
            <View style={[
              styles.dropdownContainer,
              { top: 75 + (Dimensions.get('window').width < 768 ? insets.top : 0) }
            ]}>
              {/* Dropdown Header */}
              <View style={styles.dropdownHeader}>
                <View style={styles.dropdownAvatar}>
                  <Text style={styles.dropdownAvatarText}>JD</Text>
                </View>
                <View style={styles.dropdownUserInfo}>
                  <Text style={styles.dropdownUserName}>John Doe</Text>
                  <Text style={styles.dropdownUserEmail} numberOfLines={1}>
                    souravghoshmgu1@gmail.com
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              {/* Menu Items */}
              <TouchableOpacity style={styles.menuItem} onPress={handleProfilePress}>
                <Text style={styles.menuIconText}>👤</Text>
                <Text style={styles.menuLabel}>My Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}>
                <Text style={styles.menuIconText}>⚙️</Text>
                <Text style={styles.menuLabel}>Settings</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={[styles.menuIconText, { color: COLORS.error }]}>↳</Text>
                <Text style={[styles.menuLabel, { color: COLORS.error }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <SettingsOverlay
        isVisible={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 70,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    backgroundColor: COLORS.bgDark,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: 16,
    padding: 4,
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
  },
  userInfo: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  userRole: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  chevron: {
    color: COLORS.textMuted,
    marginLeft: 8,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdownContainer: {
    position: 'absolute',
    right: 20,
    width: 260,
    backgroundColor: COLORS.white, // Light background as in screenshot
    borderRadius: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dropdownAvatar: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  dropdownUserInfo: {
    marginLeft: 14,
    flex: 1,
  },
  dropdownUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  dropdownUserEmail: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuIconText: {
    fontSize: 18,
    marginRight: 14,
    color: '#64748B',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#334155',
  },
});
