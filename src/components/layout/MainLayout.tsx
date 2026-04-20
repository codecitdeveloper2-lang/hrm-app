import { useTheme } from '../../styles/ThemeProvider';
import React from 'react';
import {View, StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import {COLORS} from '../../styles';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({children}: MainLayoutProps) {
  const { colors: THEME_COLORS, isDarkMode } = useTheme();
  const styles = _getStyles(THEME_COLORS);
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={THEME_COLORS.bgDark} 
      />
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

const _getStyles = (COLORS: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
});
