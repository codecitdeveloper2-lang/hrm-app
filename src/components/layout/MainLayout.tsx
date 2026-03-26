import React from 'react';
import {View, StyleSheet, SafeAreaView, StatusBar} from 'react-native';
import {COLORS} from '../../styles';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({children}: MainLayoutProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />
      <View style={styles.container}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
});
