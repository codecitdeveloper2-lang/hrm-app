import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated, Dimensions } from 'react-native';
import { COLORS } from '../../styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 250;

interface SidebarItem {
  key: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  items: SidebarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ items, activeKey, onSelect, isOpen, onClose, isMobile }: SidebarProps) {
  const slideAnim = useRef(new Animated.Value(isMobile ? -SIDEBAR_WIDTH : 0)).current;

  useEffect(() => {
    if (isMobile) {
      Animated.timing(slideAnim, {
        toValue: isOpen ? 0 : -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [isOpen, isMobile, slideAnim]);

  const containerStyle = [
    styles.container,
    isMobile && styles.mobileContainer,
    isMobile && { transform: [{ translateX: slideAnim }] },
  ];

  return (
    <Animated.View style={containerStyle}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Text style={styles.brandEmoji}>🚀</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.brandText}>CodecIT</Text>
          <Text style={styles.brandSubtitle}>HR Management</Text>
        </View>
      </View>

      {/* Navigation */}
      <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onSelect(item.key)}
              activeOpacity={0.7}>
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    backgroundColor: COLORS.bgMid,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 24,
  },
  mobileContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 15,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  brandEmoji: {
    fontSize: 16,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: -2,
  },
  nav: {
    flex: 1,
    paddingHorizontal: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  navItemActive: {
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  navLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  navLabelActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
});
