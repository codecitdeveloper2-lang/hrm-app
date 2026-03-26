import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  Animated,
} from 'react-native';
import {COLORS, BORDER_RADIUS} from '../../../styles';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const buttonStyles = [
    styles.base,
    styles[`${variant}Bg`],
    styles[`${size}Size`],
    disabled && styles.disabled,
    style,
  ];

  const labelStyles = [
    styles.label,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <Animated.View style={{transform: [{scale: scaleAnim}]}}>
      <TouchableOpacity
        style={buttonStyles}
        activeOpacity={0.85}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}>
        {loading ? (
          <ActivityIndicator color={COLORS.white} size="small" />
        ) : (
          <>
            {icon}
            <Text style={labelStyles}>{title}</Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  // Variants
  primaryBg: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  secondaryBg: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  ghostBg: {
    backgroundColor: 'transparent',
  },
  // Sizes
  smSize: {paddingVertical: 10, paddingHorizontal: 16},
  mdSize: {paddingVertical: 14, paddingHorizontal: 24},
  lgSize: {paddingVertical: 16, paddingHorizontal: 32},
  // Text
  label: {fontWeight: '700', letterSpacing: 0.8},
  primaryText: {color: COLORS.white, fontSize: 16},
  secondaryText: {color: COLORS.textSecondary, fontSize: 14},
  ghostText: {color: COLORS.accentLight, fontSize: 14},
  smText: {fontSize: 13},
  mdText: {fontSize: 15},
  lgText: {fontSize: 16},
  // State
  disabled: {opacity: 0.5},
});
