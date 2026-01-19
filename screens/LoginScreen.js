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

export default function LoginScreen({ onNavigate, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const validateForm = () => {
    setError('');

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Email is required');
      return false;
    }

    if (!validateEmail(normalizedEmail)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    setError('');
    
    try {
      // HARDCODED ADMIN LOGIN (Demo/Development Only)
      if (normalizedEmail === 'admin@gmail.com' && password === '123456') {
        console.log('🔑 HARDCODED ADMIN LOGIN DETECTED');

        // Create fake admin session
        const fakeAdminSession = {
          user: {
            id: 'admin-hardcoded-id',
            email: 'admin@gmail.com',
            role: 'admin',
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          },
          access_token: 'fake-admin-token',
          refresh_token: 'fake-admin-refresh',
        };
        
        // Store in AsyncStorage for persistence
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('fake-admin-session', JSON.stringify(fakeAdminSession));
        
        console.log('✅ Admin logged in (hardcoded)', {
          email: normalizedEmail,
          role: 'admin',
        });
        
        setLoading(false);
        // Close modal and trigger re-check in App.js
        if (onClose) {
          onClose();
          // Small delay to ensure AsyncStorage write completes
          setTimeout(() => {
            if (onNavigate) onNavigate('main');
          }, 100);
        }
        return;
      }

      console.log('🔐 Login attempt (Supabase)', {
        email: normalizedEmail,
        passwordLength: password.length,
        passwordProvided: Boolean(password),
      });
      
      // Clear any stale session
      await supabase.auth.signOut();
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      
      console.log('📥 Supabase login response:', {
        hasSession: Boolean(signInData?.session),
        hasUser: Boolean(signInData?.user),
        userEmail: signInData?.user?.email,
        userId: signInData?.user?.id,
        emailConfirmed: signInData?.user?.email_confirmed_at ? 'yes' : 'no',
        error: signInError?.message,
        errorCode: signInError?.code,
        errorStatus: signInError?.status,
      });

      if (signInError) {
        console.error('❌ Login failed:', {
          email: normalizedEmail,
          passwordLength: password.length,
          message: signInError.message,
          status: signInError.status,
          code: signInError.code,
        });

        // Provide helpful error messages
        if (signInError.status === 400 && signInError.message?.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check and try again.\n\nIf you just signed up, wait a moment before logging in.');
        } else if (signInError.message?.includes('Email not confirmed')) {
          setError('Please confirm your email before logging in. Check your inbox for a confirmation link.');
        } else {
          setError(`Login failed: ${signInError.message || 'Invalid credentials'}`);
        }
      } else {
        console.log('✅ Login successful (Supabase)', {
          email: signInData?.user?.email,
          userId: signInData?.session?.user?.id,
          isAdmin: signInData?.user?.email === 'admin@gmail.com',
        });

        // Supabase auth state change will handle role resolution and navigation
        // Just close modal and let App.js handle the rest
        setLoading(false);
        if (onClose) {
          onClose();
          setTimeout(() => {
            if (onNavigate) onNavigate('main');
          }, 100);
        }
        return;
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', {
        email: normalizedEmail,
        passwordLength: password.length,
        message: err?.message,
      });
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
              <Text style={authStyles.subtitle}>Welcome back!</Text>
            </View>

            {/* Form */}
            <View style={authStyles.form}>
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
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[authStyles.button, loading && authStyles.buttonDisabled]}
                onPress={handleLogin}
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
                    <Text style={authStyles.buttonText}>Signing In...</Text>
                  </View>
                ) : (
                  <Text style={authStyles.buttonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={authStyles.linkContainer}
                onPress={() => onNavigate('forgot')}
                disabled={loading}
              >
                <Text style={authStyles.linkText}>
                  Forgot your password?{' '}
                  <Text style={authStyles.linkHighlight}>Reset it</Text>
                </Text>
              </TouchableOpacity>

              {/* Sign Up Link */}
              <TouchableOpacity
                style={authStyles.linkContainer}
                onPress={() => onNavigate('register')}
                disabled={loading}
              >
                <Text style={authStyles.linkText}>
                  Don't have an account?{' '}
                  <Text style={authStyles.linkHighlight}>Sign Up</Text>
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
