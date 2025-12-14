import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

export default function ForgotPasswordScreen({ onBack }) {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      setError('Please enter your email');
      setMsg('');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      setMsg('');
      return;
    }

    setLoading(true);
    setError('');
    setMsg('');

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://your-app-url.com/reset-password'
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setMsg('✓ Password reset link sent! Check your email.');
      setEmail('');
    }
  };

  return (
    <LinearGradient colors={["#0f172a", "#1e293b", "#0f172a"]} style={styles.screen}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>

          <View style={styles.labelContainer}>
            <Text style={styles.label}>Email</Text>
          </View>
          <TextInput
            placeholder="your@email.com"
            placeholderTextColor="#64748b"
            value={email}
            onChangeText={(text) => { setEmail(text); setError(''); setMsg(''); }}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {msg ? <Text style={styles.success}>{msg}</Text> : null}

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleReset}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? ['#475569', '#475569'] : ['#0ea5e9', '#0284c7']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.link}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, color: '#e0f2fe', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 24, textAlign: 'center' },
  labelContainer: { marginBottom: 6 },
  label: { color: '#cbd5e1', fontSize: 14, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 14,
    width: '100%',
    marginBottom: 16,
    fontSize: 16,
    color: '#e2e8f0'
  },
  button: { width: '100%', borderRadius: 12, overflow: 'hidden', marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonGradient: { padding: 16, alignItems: 'center' },
  buttonText: { color: '#0b1021', fontWeight: '800', fontSize: 16 },
  backButton: { alignSelf: 'center', marginTop: 8 },
  link: { color: '#67e8f9', fontWeight: '700', fontSize: 15 },
  error: { color: '#f87171', marginBottom: 12, fontSize: 14 },
  success: { color: '#34d399', marginBottom: 12, fontSize: 14 }
});
