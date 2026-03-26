import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {COLORS} from '../../styles';

interface SidebarItem {
  key: string;
  label: string;
  icon: string;
}

interface SidebarProps {
  items: SidebarItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export default function Sidebar({items, activeKey, onSelect}: SidebarProps) {
  return (
    <View style={styles.container}>
      {/* Brand */}
      <View style={styles.brand}>
        <View style={styles.brandIcon}>
          <Text style={styles.brandEmoji}>🔐</Text>
        </View>
        <Text style={styles.brandText}>LoginApp</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 240,
    backgroundColor: COLORS.bgMid,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.06)',
    paddingVertical: 24,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandEmoji: {
    fontSize: 18,
  },
  brandText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
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
