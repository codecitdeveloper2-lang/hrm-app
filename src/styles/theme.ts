// Global Theme & Design Tokens
export const DARK_COLORS = {
  // Primary
  bgDark: '#0B0F1E',
  bgMid: '#111936',
  bgCard: '#1A1F3D',

  // Accent
  accent: '#6366F1',
  accentLight: '#818CF8',
  accentGlow: 'rgba(99, 102, 241, 0.25)',

  // Glass
  cardBg: 'rgba(255, 255, 255, 0.06)',
  cardBorder: 'rgba(255, 255, 255, 0.12)',
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.10)',
  inputFocusBorder: '#6C63FF',

  // Text
  white: '#FFFFFF',
  textPrimary: '#F0F0F5',
  textSecondary: 'rgba(255, 255, 255, 0.55)',
  textMuted: 'rgba(255, 255, 255, 0.35)',

  // Status
  error: '#FF6B6B',
  success: '#4ECDC4',
  warning: '#FFE66D',
  info: '#4DA8DA',
};

export const LIGHT_COLORS = {
  // Primary
  bgDark: '#F8FAFC', 
  bgMid: '#F1F5F9',
  bgCard: '#FFFFFF', 

  // Accent
  accent: '#6366F1',
  accentLight: '#818CF8',
  accentGlow: 'rgba(99, 102, 241, 0.12)',

  // Glass/Containers
  cardBg: '#FFFFFF',
  cardBorder: '#E2E8F0',
  inputBg: '#F1F5F9',
  inputBorder: '#CBD5E1',
  inputFocusBorder: '#6366F1',

  // Text
  white: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',

  // Status
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export let currentTheme: 'dark' | 'light' = 'dark';
export const setThemeMode = (mode: 'dark' | 'light') => {
  currentTheme = mode;
};

export const COLORS = new Proxy({} as typeof DARK_COLORS, {
  get: (_, prop) => {
    return currentTheme === 'dark' 
      ? DARK_COLORS[prop as keyof typeof DARK_COLORS] 
      : LIGHT_COLORS[prop as keyof typeof LIGHT_COLORS];
  }
});

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  hero: 34,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};
