import React, {useState, useRef, useEffect} from 'react';
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

const {width, height} = Dimensions.get('window');

const COLORS = {
  bgDark: '#0B0F1E',
  bgMid: '#111936',
  cardBg: 'rgba(255, 255, 255, 0.06)',
  cardBorder: 'rgba(255, 255, 255, 0.12)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.10)',
  inputFocusBorder: '#6C63FF',
  accent: '#6C63FF',
  accentLight: '#8B83FF',
  accentGlow: 'rgba(108, 99, 255, 0.3)',
  white: '#FFFFFF',
  textPrimary: '#F0F0F5',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textMuted: 'rgba(255, 255, 255, 0.35)',
  error: '#FF6B6B',
  success: '#4ECDC4',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const cardSlide = useRef(new Animated.Value(60)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
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
  }, []);

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert('Success', `Welcome, ${email}!`);
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
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
                  transform: [{translateY: slideAnim}, {scale: logoScale}],
                },
              ]}>
              <View style={styles.logoContainer}>
                <View style={styles.logoOuter}>
                  <View style={styles.logoInner}>
                    <Text style={styles.logoIcon}>🔐</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.welcomeTitle}>Welcome Back</Text>
              <Text style={styles.welcomeSubtitle}>Sign in to continue</Text>
            </Animated.View>

            {/* Glass Card */}
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: cardFade,
                  transform: [{translateY: cardSlide}],
                },
              ]}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    emailFocused && styles.inputWrapperFocused,
                  ]}>
                  <Text style={styles.inputIcon}>✉️</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="you@example.com"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    passwordFocused && styles.inputWrapperFocused,
                  ]}>
                  <Text style={styles.inputIcon}>🔒</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!isPasswordVisible}
                    value={password}
                    onChangeText={setPassword}
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
              <Animated.View style={{transform: [{scale: buttonScale}]}}>
                <TouchableOpacity
                  style={styles.loginButton}
                  activeOpacity={0.85}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                  onPress={handleLogin}>
                  <View style={styles.buttonGradient}>
                    <Text style={styles.loginButtonText}>Sign In</Text>
                    <Text style={styles.buttonArrow}>→</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>

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
                    source={require('./src/assets/google_logo.png')} 
                    style={styles.socialIcon} 
                    resizeMode="contain"
                  />
                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Sign Up Link */}
            <Animated.View
              style={[
                styles.signupContainer,
                {opacity: cardFade},
              ]}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Background decorative elements moved to bottom with explicit isolation */}
      <View 
        pointerEvents="none" 
        style={[StyleSheet.absoluteFill, {zIndex: -1}]}>
        <Animated.View
          style={[
            styles.bgOrb1,
            {opacity: glowOpacity},
          ]}
        />
        <Animated.View
          style={[
            styles.bgOrb2,
            {opacity: glowOpacity},
          ]}
        />
        <View style={styles.bgOrb3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  keyboardInner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    minHeight: height,
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
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  logoIcon: {
    fontSize: 28,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 6,
    letterSpacing: 0.3,
  },

  // Glass Card
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },

  // Input
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
  },
  inputWrapperFocused: {
    borderColor: COLORS.inputFocusBorder,
    backgroundColor: 'rgba(108, 99, 255, 0.06)',
    shadowColor: COLORS.accent,
    shadowOffset: {width: 0, height: 0},
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

  // Login Button
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.accent,
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.8,
  },
  buttonArrow: {
    fontSize: 18,
    color: COLORS.white,
    marginLeft: 8,
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

  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
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