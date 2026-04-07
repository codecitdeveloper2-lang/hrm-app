import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, useWindowDimensions, TouchableWithoutFeedback, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../styles';
import Sidebar from './Sidebar';
import Header from './Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  activeMenu: string;
  onMenuSelect: (key: string) => void;
}

const MENU_ITEMS = [
  { key: 'Dashboard', label: 'Dashboard', icon: '📊' },
  { key: 'Attendance', label: 'Attendance', icon: '✅' },
  { key: 'Schedule', label: 'Schedule', icon: '📅' },
  { key: 'Leave', label: 'Leave', icon: '✉️' },
  { key: 'Reimbursements', label: 'Reimbursements', icon: '💰' },
  { key: 'Profile', label: 'My Profile', icon: '👤' },
];

export default function DashboardLayout({
  children,
  title,
  activeMenu,
  onMenuSelect
}: DashboardLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isMobile = width < 768;

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleMenuSelect = (key: string) => {
    onMenuSelect(key);
    if (isMobile) {
      closeMenu();
    }
  };

  return (
    <View style={[styles.container, { paddingTop: isMobile ? insets.top : 0 }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <View style={styles.horizontalWrapper}>
        {/* Sidebar */}
        <Sidebar
          items={MENU_ITEMS}
          activeKey={activeMenu}
          onSelect={handleMenuSelect}
          isOpen={isMenuOpen}
          onClose={closeMenu}
          isMobile={isMobile}
        />

        {/* Mobile Backdrop */}
        {isMobile && isMenuOpen && (
          <TouchableWithoutFeedback onPress={closeMenu}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
        )}

        <View style={styles.mainArea}>
          <Header 
            title={title} 
            onMenuPress={toggleMenu}
            showMenuButton={isMobile}
          />
          <View style={styles.content}>
            {children}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  horizontalWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  mainArea: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 99,
  },
});
