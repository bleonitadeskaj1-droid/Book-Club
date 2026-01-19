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
  getErrorMessage,
} from '../styles/authStyles';

export default function ForgotPasswordScreen({ onNavigate, onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);

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
    
    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: 'bookclub://reset-password',
        }
      );

      if (resetError) {
        setError(getErrorMessage(resetError));
      } else {
        setEmailSent(true);
        setEmail('');
        
        // Auto-navigate after 3 seconds
        setTimeout(() => {
          onNavigate('login');
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Reset password error:', err);
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
              <Text style={authStyles.emoji}>🔐</Text>
              <Text style={authStyles.title}>Reset Password</Text>
              <Text style={authStyles.subtitle}>We'll help you regain access</Text>
            </View>

            {/* Form */}
            <View style={authStyles.form}>
              {emailSent ? (
                <>
                  {/* Success State */}
                  <View style={authStyles.successContainer}>
                    <Text style={authStyles.successText}>
                      ✓ Password reset email sent!
                    </Text>
                  </View>
                  <View style={authStyles.form}>
                    <Text style={authStyles.description}>
                      Check your email for a link to reset your password. The link will expire after a few hours.
                    </Text>
                    <TouchableOpacity
                      style={authStyles.button}
                      onPress={() => onNavigate('login')}
                      activeOpacity={0.8}
                    >
                      <Text style={authStyles.buttonText}>Return to Sign In</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  {/* Form State */}
                  <Text style={authStyles.description}>
                    Enter your email address and we'll send you a link to reset your password.
                  </Text>

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

                  {/* Send Reset Link Button */}
                  <TouchableOpacity
                    style={[authStyles.button, loading && authStyles.buttonDisabled]}
                    onPress={handleResetPassword}
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
                        <Text style={authStyles.buttonText}>Sending...</Text>
                      </View>
                    ) : (
                      <Text style={authStyles.buttonText}>Send Reset Link</Text>
                    )}
                  </TouchableOpacity>

                  {/* Back to Sign In Link */}
                  <TouchableOpacity
                    style={authStyles.linkContainer}
                    onPress={() => onNavigate('login')}
                    disabled={loading}
                  >
                    <Text style={authStyles.linkText}>
                      Remember your password?{' '}
                      <Text style={authStyles.linkHighlight}>Sign In</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}
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