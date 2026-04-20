import { useTheme } from '../../../styles/ThemeProvider';
import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import {COLORS} from '../../../styles';

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export default function LoadingSpinner({
  size = 40,
  color = COLORS.accent,
}: LoadingSpinnerProps) {
  const { colors: THEME_COLORS } = useTheme();
  const styles = _getStyles(THEME_COLORS);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ).start();
  }, [rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.spinner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: 'rgba(108, 99, 255, 0.15)',
            borderTopColor: color,
            transform: [{rotate: spin}],
          },
        ]}
      />
    </View>
  );
}

const _getStyles = (COLORS: any) => StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  spinner: {
    borderWidth: 3,
  },
});
