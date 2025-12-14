import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

export default function RegisterScreen({ onBack }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setMsg('All fields are required');
      return;
    }
    if (!email.includes('@')) {
      setMsg('Enter a valid email');
      return;
    }
    if (password.length < 6) {
      setMsg('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    setMsg('');

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        setMsg(error.message);
        return;
      }

      if (data.user && !data.session) {
        setMsg('✅ Registration successful! Please check your email for confirmation link.');
      } else if (data.user) {
        // Create profile entry for the new user
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              email: email,
              role: 'user'
            }]);

          if (profileError && !profileError.message.includes('duplicate key')) {
            console.error('Profile creation error:', profileError);
            // Don't show error to user as registration was successful
          }
        } catch (profileErr) {
          console.error('Profile creation exception:', profileErr);
        }

        setMsg('✅ Account created successfully!');
      }
    } catch (err) {
      console.error('Exception:', err);
      setMsg('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#0b1324", "#0a0f1d"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={[styles.orb, styles.orbA]} />
      <View style={[styles.orb, styles.orbB]} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Join the Club</Text>
              </View>
              <Text style={styles.topHint}>Create your profile</Text>
            </View>

            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Save favorites, share notes, and collaborate.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                placeholder="Ada Lovelace"
                placeholderTextColor="#94a3b8"
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                secureTextEntry
              />
            </View>

            {msg ? <Text style={styles.msg}>{msg}</Text> : null}

            <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#f8fafc" size="small" />
              ) : (
                <Text style={styles.buttonText}>Create account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.back} onPress={onBack}>
              <Text style={styles.backText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 },
  orb: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#2563eb26'
  },
  orbA: { top: -60, right: -30 },
  orbB: { bottom: -80, left: -20, backgroundColor: '#22d3ee22' },
  card: {
    width: '90%',
    padding: 28,
    borderRadius: 24,
    backgroundColor: 'rgba(15,23,42,0.9)',
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
  title: { fontSize: 32, fontWeight: '800', color: '#e2e8f0', marginBottom: 6 },
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
  back: { alignItems: 'center', marginTop: 14 },
  backText: { color: '#67e8f9', fontWeight: '700' },
  msg: { color: '#a5f3fc', marginTop: 10, fontWeight: '600', textAlign: 'center' }
});
