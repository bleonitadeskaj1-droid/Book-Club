/**
 * Unified Authentication Styles
 * Shared styles and constants for Login, Register, and Forgot Password screens
 * Ensures consistent UI/UX across all authentication flows
 */

import { Dimensions, StyleSheet, Platform } from 'react-native';

// Get screen dimensions for responsive design
const { width: screenWidth } = Dimensions.get('window');

// Responsive scaling functions
export const scaleFont = (size) => {
  const scale = screenWidth / 375;
  return Math.round(size * Math.min(scale, 1.2));
};

export const scaleSize = (size) => {
  const scale = screenWidth / 375;
  return Math.round(size * Math.min(scale, 1.3));
};

/**
 * UNIFIED COLOR SYSTEM
 * Cream theme to match the app's primary design
 * Ensures consistency across all authentication screens
 */
export const COLORS = {
  // Primary colors - Cream theme
  primary: '#E8DCC4',           // Main cream
  primaryDark: '#D4C5A9',       // Darker cream
  primaryLight: '#F5F5DC',      // Lighter cream (beige)
  
  // Background colors
  background: '#fafafa',        // Light background
  backgroundSecondary: '#ffffff', // White for cards/inputs
  
  // Text colors
  text: '#1a1a1a',              // Dark text
  textSecondary: '#737373',     // Secondary text
  textMuted: '#a3a3a3',         // Muted text
  textInverse: '#1a1a1a',       // Dark text for cream buttons
  
  // Semantic colors
  border: '#e5e5e5',            // Light borders
  error: '#ef4444',             // Red for errors
  success: '#22c55e',           // Green for success
  warning: '#f59e0b',           // Amber for warnings
  
  // States
  disabled: '#d4d4d8',           // Disabled state
  focus: '#E8DCC4',             // Focus ring color
  
  // Shadows
  shadow: 'rgba(232, 220, 196, 0.25)', // Cream-tinted shadow
};

/**
 * UNIFIED AUTH STYLES
 * Applied consistently across all auth screens
 */
export const authStyles = StyleSheet.create({
  // Container and layout
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: scaleSize(20),
    paddingVertical: scaleSize(40),
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  
  // Header section
  headerContainer: {
    alignItems: 'center',
    marginBottom: scaleSize(40),
    width: '100%',
  },
  emoji: {
    fontSize: scaleFont(56),
    marginBottom: scaleSize(12),
  },
  title: {
    fontSize: scaleFont(32),
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: scaleSize(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scaleFont(16),
    fontWeight: '500',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  description: {
    fontSize: scaleFont(14),
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: scaleSize(24),
    lineHeight: scaleSize(21),
    marginHorizontal: scaleSize(8),
  },
  
  // Form section
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputGroup: {
    marginBottom: scaleSize(16),
  },
  inputLabel: {
    fontSize: scaleFont(12),
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: scaleSize(6),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: scaleSize(12),
    paddingHorizontal: scaleSize(16),
    paddingVertical: scaleSize(14),
    fontSize: scaleFont(16),
    color: COLORS.text,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: scaleSize(16),
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  inputFocus: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: 1.5,
  },
  
  // Button section
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: scaleSize(12),
    paddingHorizontal: scaleSize(24),
    paddingVertical: scaleSize(14),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scaleSize(48),
    marginTop: scaleSize(12),
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.disabled,
  },
  buttonText: {
    color: COLORS.textInverse,
    fontSize: scaleFont(16),
    fontWeight: '700',
    textAlign: 'center',
  },
  
  // Link navigation
  linkContainer: {
    alignItems: 'center',
    marginTop: scaleSize(20),
    paddingVertical: scaleSize(8),
  },
  linkText: {
    color: COLORS.textSecondary,
    fontSize: scaleFont(14),
    fontWeight: '500',
    textAlign: 'center',
  },
  linkHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  
  // Error and success messages
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(10),
    marginBottom: scaleSize(16),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: scaleFont(12),
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: '#dcfce7',
    borderRadius: scaleSize(8),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(10),
    marginBottom: scaleSize(16),
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  successText: {
    color: '#166534',
    fontSize: scaleFont(12),
    fontWeight: '600',
  },
  
  // Helper text
  helperText: {
    fontSize: scaleFont(12),
    color: COLORS.textMuted,
    marginTop: scaleSize(6),
    marginLeft: scaleSize(4),
  },
  requiredIndicator: {
    color: COLORS.error,
    fontWeight: '700',
  },
  
  // Divider
  divider: {
    marginVertical: scaleSize(24),
  },
  dividerLine: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  
  // Loading indicator styling
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/**
 * VALIDATION UTILITIES
 * Consistent validation across all auth screens
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validatePasswordMatch = (password1, password2) => {
  return password1 === password2 && password1.length > 0;
};

export const getPasswordStrength = (password) => {
  if (password.length < 6) return { strength: 'weak', color: COLORS.error };
  if (password.length < 10) return { strength: 'medium', color: COLORS.warning };
  return { strength: 'strong', color: COLORS.success };
};

/**
 * ERROR MESSAGE UTILITIES
 * Consistent error messaging across all auth screens
 */
export const getErrorMessage = (error) => {
  if (!error) return '';
  
  const message = error.message?.toLowerCase() || '';
  
  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (message.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }
  if (message.includes('user already registered')) {
    return 'This email is already registered. Please sign in instead.';
  }
  if (message.includes('password')) {
    return 'Password must be at least 6 characters long.';
  }
  if (message.includes('email')) {
    return 'Please enter a valid email address.';
  }
  
  return error.message || 'An error occurred. Please try again.';
};
