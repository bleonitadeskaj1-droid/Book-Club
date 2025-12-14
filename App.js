import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import BookListScreen from './screens/BookListScreen';
import AdminScreen from './screens/AdminScreen';
import { supabase } from './supabase';

export default function App() {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState('login'); // login, register, forgot
  const [hardcodedAdmin, setHardcodedAdmin] = useState(false); // Track hardcoded admin login

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        determineUserRole(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          await determineUserRole(session.user);
        } else {
          setRole(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const determineUserRole = async (user) => {
    // Check if user is admin (you can store this in user metadata or a profiles table)
    if (user.email === 'admin@gmail.com') {
      setRole('admin');
    } else {
      setRole('user');
    }
  };

  const handleLogin = (user, userRole) => {
    setRole(userRole);
    // For hardcoded admin login, don't set session but mark as hardcoded admin
    if (typeof user === 'string' && user === 'admin@gmail.com') {
      setHardcodedAdmin(true);
    }
    // For Supabase auth, session is already managed by auth state listener
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setRole(null);
    setScreen('login');
    setHardcodedAdmin(false); // Reset hardcoded admin state
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
        <ActivityIndicator size="large" color="#67e8f9" />
      </View>
    );
  }

  if (!session && !hardcodedAdmin) {
    if (screen === 'register')
      return <RegisterScreen onBack={() => setScreen('login')} />;
    if (screen === 'forgot')
      return <ForgotPasswordScreen onBack={() => setScreen('login')} />;

    return (
      <LoginScreen
        onLogin={handleLogin}
        onRegister={() => setScreen('register')}
        onForgot={() => setScreen('forgot')}
      />
    );
  }

  if (role === 'admin') {
    return (
      <AdminScreen 
        logout={handleLogout} 
        userId={hardcodedAdmin ? 'admin@gmail.com' : session.user.email}
      />
    );
  }
  
  return <BookListScreen userId={session.user.email} isAdmin={false} logout={handleLogout} />;
}
