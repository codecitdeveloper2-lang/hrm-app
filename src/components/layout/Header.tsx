import { useTheme } from '../../styles/ThemeProvider';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../styles';
import SettingsOverlay from './SettingsOverlay';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { apiSlice } from '../../store/api/apiSlice';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onMenuPress?: () => void;
  onProfilePress?: () => void;
  showMenuButton?: boolean;
}

export default function Header({ title, subtitle, onMenuPress, onProfilePress, showMenuButton }: HeaderProps) {
  const { colors: THEME_COLORS, isDarkMode } = useTheme();
  const styles = _getStyles(THEME_COLORS);
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
    <>
      <View style={[styles.container, { height: 75 }]}>
        <View style={styles.leftSection}>
          {showMenuButton && (
            <TouchableOpacity onPress={onMenuPress} style={styles.menuButton}>
              <Text style={[styles.menuIcon, {color: THEME_COLORS.textPrimary}]}>☰</Text>
            </TouchableOpacity>
          )}
          <View>
            <Text style={[styles.title, {color: THEME_COLORS.textPrimary}]}>{title}</Text>
            {subtitle && <Text style={[styles.subtitle, {color: THEME_COLORS.textSecondary}]}>{subtitle}</Text>}
          </View>
        </View>

        <TouchableOpacity 
          style={styles.userProfile} 
          onPress={toggleDropdown}
          activeOpacity={0.5}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <View style={styles.userInfo}>
            <Text style={[styles.userName, {color: THEME_COLORS.textPrimary}]}>John Doe</Text>
            <Text style={[styles.userRole, {color: THEME_COLORS.textSecondary}]}>Developer</Text>
          </View>
          <View style={[styles.avatar, {backgroundColor: THEME_COLORS.accent, borderColor: THEME_COLORS.cardBorder}]}>
            <Text style={[styles.avatarText, {color: '#FFFFFF'}]}>JD</Text>
          </View>
          <Text style={[styles.chevron, {color: THEME_COLORS.textMuted}]}>{showDropdown ? '▴' : '▾'}</Text>
        </TouchableOpacity>

        <SettingsOverlay
          isVisible={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </View>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}>
        <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
          <View style={styles.modalOverlay}>
            <View style={[
              styles.dropdownContainer,
              { 
                top: 70, 
                backgroundColor: isDarkMode ? '#1E293B' : THEME_COLORS.bgCard, 
                borderColor: THEME_COLORS.cardBorder 
              }
            ]}>
              <View style={styles.dropdownHeader}>
                <View style={[styles.dropdownAvatar, {backgroundColor: THEME_COLORS.accent}]}>
                  <Text style={[styles.dropdownAvatarText, {color: '#FFFFFF'}]}>JD</Text>
                </View>
                <View style={styles.dropdownUserInfo}>
                  <Text style={[styles.dropdownUserName, {color: THEME_COLORS.textPrimary}]}>John Doe</Text>
                  <Text style={[styles.dropdownUserEmail, {color: THEME_COLORS.textSecondary}]} numberOfLines={1}>
                    john.doe@example.com
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, {backgroundColor: THEME_COLORS.cardBorder}]} />

              <TouchableOpacity style={styles.menuItem} onPress={handleProfilePress}>
                <Text style={styles.menuIconText}>👤</Text>
                <Text style={[styles.menuLabel, {color: THEME_COLORS.textPrimary}]}>My Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleSettingsPress}>
                <Text style={styles.menuIconText}>⚙️</Text>
                <Text style={[styles.menuLabel, {color: THEME_COLORS.textPrimary}]}>Settings</Text>
              </TouchableOpacity>

              <View style={[styles.divider, {backgroundColor: THEME_COLORS.cardBorder}]} />

              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={[styles.menuIconText, { color: THEME_COLORS.error }]}>↳</Text>
                <Text style={[styles.menuLabel, { color: THEME_COLORS.error }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const _getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
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
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 12,
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
  },
  userRole: {
    fontSize: 11,
    marginTop: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chevron: {
    marginLeft: 8,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdownContainer: {
    position: 'absolute',
    right: 20,
    width: 280,
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 25,
    borderWidth: 1,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  dropdownAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  dropdownAvatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  dropdownUserInfo: {
    marginLeft: 18,
    flex: 1,
  },
  dropdownUserName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  dropdownUserEmail: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.6,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginHorizontal: 8,
    borderRadius: 12,
  },
  menuIconText: {
    fontSize: 20,
    marginRight: 16,
    width: 24,
    textAlign: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
