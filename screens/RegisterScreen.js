import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../supabase';
import {
  authStyles,
  COLORS,
  scaleFont,
  scaleSize,
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  getPasswordStrength,
  getErrorMessage,
} from '../styles/authStyles';

export default function RegisterScreen({ onNavigate, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [confirmFocus, setConfirmFocus] = useState(false);

  const validateForm = () => {
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (!confirmPassword) {
      setError('Please confirm your password');
      return false;
    }
    
    if (!validatePasswordMatch(password, confirmPassword)) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const normalizedEmail = email.trim().toLowerCase();
      
      console.log('📝 Signup attempt:', { 
        email: normalizedEmail,
        passwordLength: password.length 
      });
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
      });

      console.log('🔐 Signup response:', {
        userId: data?.user?.id,
        email: data?.user?.email,
        sessionReturned: Boolean(data?.session),
        emailConfirmed: data?.user?.email_confirmed_at ? 'yes' : 'no',
        error: signUpError?.message,
        errorCode: signUpError?.code,
      });

      if (signUpError) {
        console.error('❌ Signup failed:', signUpError.message);
        if (signUpError.message?.includes('already registered')) {
          setError('This email is already registered. Please log in or use a different email.');
        } else {
          setError(`Signup failed: ${signUpError.message}`);
        }
        setLoading(false);
        return;
      }

      if (!data?.user?.id) {
        console.error('❌ Signup: no user returned');
        setError('Signup failed: no user created');
        setLoading(false);
        return;
      }

      const userId = data.user.id;
      const isConfirmed = Boolean(data.user.email_confirmed_at);
      
      console.log('✅ User registered:', {
        userId,
        email: data.user.email,
        emailConfirmed: isConfirmed ? 'yes' : 'no',
      });

      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      // Show success and navigate to login
      setSuccess('✅ Account created! Redirecting to login...');
      
      setTimeout(() => {
        console.log('↩️ Navigating to login');
        if (onNavigate) onNavigate('login');
      }, 1500);

    } catch (err) {
      console.error('❌ Signup exception:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={authStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={authStyles.content}>
            {/* Close Button (only show if onClose provided) */}
            {onClose && (
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            )}

            {/* Header */}
            <View style={authStyles.headerContainer}>
              <Text style={authStyles.emoji}>📚</Text>
              <Text style={authStyles.title}>Book Club</Text>
              <Text style={authStyles.subtitle}>Join our community!</Text>
            </View>

            {/* Form */}
            <View style={authStyles.form}>
              {/* Success Message */}
              {success ? (
                <View style={authStyles.successContainer}>
                  <Text style={authStyles.successText}>{success}</Text>
                </View>
              ) : null}

              {/* Error Message */}
              {error ? (
                <View style={authStyles.errorContainer}>
                  <Text style={authStyles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Email Input */}
              <View style={authStyles.inputGroup}>
                <Text style={authStyles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[
                    authStyles.input,
                    emailFocus && authStyles.inputFocus,
                  ]}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (error) setError('');
                  }}
                  onFocus={() => setEmailFocus(true)}
                  onBlur={() => setEmailFocus(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
              </View>

              {/* Password Input */}
              <View style={authStyles.inputGroup}>
                <Text style={authStyles.inputLabel}>Password</Text>
                <TextInput
                  style={[
                    authStyles.input,
                    passwordFocus && authStyles.inputFocus,
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) setError('');
                  }}
                  onFocus={() => setPasswordFocus(true)}
                  onBlur={() => setPasswordFocus(false)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {password && (
                  <Text style={authStyles.helperText}>
                    Password strength:{' '}
                    <Text style={{ color: getPasswordStrength(password).color }}>
                      {getPasswordStrength(password).strength}
                    </Text>
                  </Text>
                )}
              </View>

              {/* Confirm Password Input */}
              <View style={authStyles.inputGroup}>
                <Text style={authStyles.inputLabel}>Confirm Password</Text>
                <TextInput
                  style={[
                    authStyles.input,
                    confirmFocus && authStyles.inputFocus,
                    password && confirmPassword && !validatePasswordMatch(password, confirmPassword)
                      ? authStyles.inputError
                      : null,
                  ]}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (error) setError('');
                  }}
                  onFocus={() => setConfirmFocus(true)}
                  onBlur={() => setConfirmFocus(false)}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                />
                {password && confirmPassword && !validatePasswordMatch(password, confirmPassword) && (
                  <Text style={[authStyles.helperText, { color: COLORS.error }]}>
                    Passwords do not match
                  </Text>
                )}
                {password && confirmPassword && validatePasswordMatch(password, confirmPassword) && (
                  <Text style={[authStyles.helperText, { color: COLORS.success }]}>
                    ✓ Passwords match
                  </Text>
                )}
              </View>

              {/* Create Account Button */}
              <TouchableOpacity
                style={[authStyles.button, loading && authStyles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={authStyles.loadingContainer}>
                    <ActivityIndicator
                      size="small"
                      color={COLORS.textInverse}
                      style={{ marginRight: scaleSize(8) }}
                    />
                    <Text style={authStyles.buttonText}>Creating Account...</Text>
                  </View>
                ) : (
                  <Text style={authStyles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Sign In Link */}
              <TouchableOpacity
                style={authStyles.linkContainer}
                onPress={() => onNavigate('login')}
                disabled={loading}
              >
                <Text style={authStyles.linkText}>
                  Already have an account?{' '}
                  <Text style={authStyles.linkHighlight}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});