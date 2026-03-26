import {StyleSheet} from 'react-native';
import {COLORS, SPACING, BORDER_RADIUS} from './theme';

export const globalStyles = StyleSheet.create({
  // Screen containers
  screenContainer: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.bgDark,
  },

  // Cards
  glassCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },

  // Typography
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  subheading: {
    fontSize: 15,
    color: COLORS.textSecondary,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
