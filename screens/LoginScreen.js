import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

export default function LoginScreen({ onLogin, onRegister, onForgot }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password required');
      return;
    }
    
    // Special case for admin account (bypass Supabase for demo purposes)
    if (email === 'admin@gmail.com' && password === '123456') {
      setError('');
      onLogin(email, 'admin');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        return;
      }

      if (data.user) {
        // Ensure profile exists
        try {
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.user.id)
            .single();

          if (!existingProfile) {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([{
                id: data.user.id,
                email: email,
                role: email === 'admin@gmail.com' ? 'admin' : 'user'
              }]);

            if (profileError && !profileError.message.includes('duplicate key')) {
              console.error('Profile creation error:', profileError);
            }
          }
        } catch (profileErr) {
          console.error('Profile check exception:', profileErr);
        }

        // Check if user is admin
        const isAdmin = email === 'admin@gmail.com';
        onLogin(data.user, isAdmin ? 'admin' : 'user');
      }
    } catch (err) {
      console.error('Exception:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#111827", "#0b1021"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Decorative orbs */}
      <View style={[styles.orb, styles.orbOne]} />
      <View style={[styles.orb, styles.orbTwo]} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Club Access</Text>
            </View>
            <Text style={styles.topHint}>Members & Admins</Text>
          </View>

          <Text style={styles.title}>Book Club</Text>
          <Text style={styles.subtitle}>Read together, think sharper.</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#f8fafc" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.rowBetween}>
            <TouchableOpacity onPress={onForgot}>
              <Text style={styles.link}>Forgot password?</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onRegister}>
              <Text style={styles.linkStrong}>Create account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#2563eb33'
  },
  orbOne: { top: -40, left: -30 },
  orbTwo: { bottom: -60, right: -20, backgroundColor: '#22d3ee33' },
  card: {
    width: '90%',
    padding: 28,
    borderRadius: 24,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  badge: {
    backgroundColor: '#22d3ee22',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999
  },
  badgeText: { color: '#67e8f9', fontWeight: '700', letterSpacing: 0.3 },
  topHint: { color: '#cbd5e1', fontSize: 12 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#e2e8f0',
    textAlign: 'left',
    marginBottom: 4
  },
  subtitle: { fontSize: 15, color: '#94a3b8', marginBottom: 22 },
  fieldGroup: { marginBottom: 14 },
  label: { color: '#cbd5e1', marginBottom: 6, fontWeight: '600', letterSpacing: 0.2 },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#1d4ed8',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: { color: '#f8fafc', fontWeight: '700', fontSize: 17 },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16
  },
  link: { color: '#cbd5e1', fontWeight: '600' },
  linkStrong: { color: '#67e8f9', fontWeight: '700' },
  error: {
    color: '#f87171',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600'
  }
});
