import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { COLORS, globalStyles } from '../../styles';
import Button from '../../components/common/Button';

const { width, height } = Dimensions.get('window');

interface LoginProps {
  onLogin?: () => void;
}

export default function LoginScreen({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animations
    Animated.sequence([
      // Logo animation
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      // Card animation
      Animated.parallel([
        Animated.timing(cardFade, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(cardSlide, {
          toValue: 0,
          friction: 8,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Continuous glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [cardFade, cardSlide, fadeAnim, logoScale, slideAnim, glowAnim]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      onLogin?.();
    }, 1500);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={globalStyles.screenContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgDark} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{flex: 1}}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          contentContainerStyle={{flexGrow: 1}}
          keyboardShouldPersistTaps="handled"
          style={{flex: 1}}>
          <View style={styles.keyboardInner}>
            {/* Logo / Brand Section */}
            <Animated.View
              style={[
                styles.logoSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }, { scale: logoScale }],
                },
              ]}>
              <View style={styles.logoContainer}>
                <View style={styles.logoOuter}>
                  <View style={styles.logoInner}>
                    <Image
                      source={require('../../assets/logo.png')}
                      style={styles.logoImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
              </View>
              <Text style={globalStyles.heading}>Welcome Back</Text>
              <Text style={globalStyles.subheading}>Sign in to continue</Text>
            </Animated.View>

            {/* Glass Card */}
            <Animated.View
              style={[
                globalStyles.glassCard,
                {
                  opacity: cardFade,
                  transform: [{ translateY: cardSlide }],
                },
              ]}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <TouchableOpacity 
                  activeOpacity={1}
                  onPress={() => emailRef.current?.focus()}>
                  <Text style={globalStyles.label}>Email Address</Text>
                </TouchableOpacity>
                <View
                  pointerEvents="box-none"
                  style={[
                    styles.inputWrapper,
                    emailFocused && styles.inputWrapperFocused,
                  ]}>
                  <Text style={styles.inputIcon} pointerEvents="none">✉️</Text>
                  <TextInput
                    ref={emailRef}
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    editable={true}
                    selectionColor={COLORS.accent}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <TouchableOpacity 
                  activeOpacity={1}
                  onPress={() => passwordRef.current?.focus()}>
                  <Text style={globalStyles.label}>Password</Text>
                </TouchableOpacity>
                <View
                  pointerEvents="box-none"
                  style={[
                    styles.inputWrapper,
                    passwordFocused && styles.inputWrapperFocused,
                  ]}>
                  <Text style={styles.inputIcon} pointerEvents="none">🔒</Text>
                  <TextInput
                    ref={passwordRef}
                    style={styles.input}
                    placeholder="Enter your password"
                    editable={true}
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!isPasswordVisible}
                    value={password}
                    onChangeText={setPassword}
                    selectionColor={COLORS.accent}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="off"
                  />
                  <TouchableOpacity
                    onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                    style={styles.eyeButton}>
                    <Text style={styles.eyeIcon}>
                      {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotContainer}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Button
                title="Sign In"
                onPress={handleLogin}
                loading={loading}
                icon={<Text style={styles.buttonArrow}>→ </Text>}
              />

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialButton}>
                  <Image
                    source={require('../../assets/google_logo.png')}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.socialText}>Continue with Google</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Background orbs temporarily disabled for testing focus */}
      {/* 
      <View 
        pointerEvents="none" 
        style={[StyleSheet.absoluteFill, {zIndex: -10}]}>
        <Animated.View
          style={[
            styles.bgOrb1,
            { opacity: glowOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.bgOrb2,
            { opacity: glowOpacity },
          ]}
        />
        <View style={styles.bgOrb3} />
      </View> 
      */}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboardInner: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: 'center',
  },

  // Background Orbs
  bgOrb1: {
    position: 'absolute',
    top: -height * 0.1,
    right: -width * 0.2,
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
  },
  bgOrb2: {
    position: 'absolute',
    bottom: -height * 0.05,
    left: -width * 0.3,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: 'rgba(139, 131, 255, 0.08)',
  },
  bgOrb3: {
    position: 'absolute',
    top: height * 0.4,
    left: width * 0.5,
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.15,
    backgroundColor: 'rgba(78, 205, 196, 0.06)',
  },

  // Logo Section
  logoSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoOuter: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(108, 99, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  logoInner: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },

  // Input
  inputGroup: {
    marginBottom: 18,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    height: 52,
    marginTop: 8,
  },
  inputWrapperFocused: {
    borderColor: COLORS.inputFocusBorder,
    backgroundColor: 'rgba(108, 99, 255, 0.06)',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    color: COLORS.textPrimary,
    letterSpacing: 0.3,
    paddingLeft: 10,
    paddingRight: 10,
    zIndex: 10,
  },
  eyeButton: {
    padding: 6,
  },
  eyeIcon: {
    fontSize: 18,
  },

  // Forgot Password
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 22,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.accentLight,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  buttonArrow: {
    fontSize: 18,
    color: COLORS.white,
    fontWeight: '700',
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginHorizontal: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },

  // Social Buttons
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  socialIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },
  socialText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  // Sign Up
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  signupText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  signupLink: {
    fontSize: 14,
    color: COLORS.accentLight,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
