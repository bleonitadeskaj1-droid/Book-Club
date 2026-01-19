import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Get screen dimensions for responsive design
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth >= 768;

// Responsive scaling functions
const scaleFont = (size) => {
  const scale = screenWidth / 375;
  const maxScale = isTablet ? 1.4 : 1.2;
  return Math.round(size * Math.min(scale, maxScale));
};

const scaleSize = (size) => {
  const scale = screenWidth / 375;
  const maxScale = isTablet ? 1.5 : 1.3;
  return Math.round(size * Math.min(scale, maxScale));
};

// Color constants - Modern, warm color palette
const COLORS = {
  // Primary colors - Warm amber/orange theme
  primary: '#f59e0b',           // Warm amber
  primaryDark: '#d97706',       // Darker amber
  primaryLight: '#fbbf24',      // Lighter amber
  
  // Background colors - Soft, readable
  background: '#fef7ed',        // Warm cream background
  backgroundSecondary: '#ffffff', // Pure white for cards
  backgroundAccent: '#fed7aa',  // Light orange accent
  
  // Text colors - High contrast and readable
  text: '#1f2937',              // Dark gray for primary text
  textSecondary: '#6b7280',     // Medium gray for secondary text
  textMuted: '#9ca3af',         // Light gray for muted text
  
  // Semantic colors
  border: '#e5e7eb',            // Light gray borders
  borderLight: '#f3f4f6',       // Very light borders
  error: '#ef4444',             // Red for errors
  success: '#10b981',           // Green for success
  warning: '#f59e0b',           // Amber for warnings
  
  // Interactive states
  hover: '#fed7aa',             // Light hover background
  focus: '#f59e0b',             // Focus ring color
  
  // Shadows and overlays
  shadow: 'rgba(0, 0, 0, 0.1)', // Subtle shadows
  overlay: 'rgba(0, 0, 0, 0.05)', // Light overlays
};

export default function AdminSidebar({ activeTab, onTabChange, onLogout, userEmail }) {
  const menuItems = [
    { id: 'books', label: 'Manage Books', icon: 'book-outline' },
    { id: 'users', label: 'Manage Users', icon: 'people-outline' },
    { id: 'reviews', label: 'Manage Reviews', icon: 'star-outline' },
    { id: 'analytics', label: 'Analytics', icon: 'bar-chart-outline' },
  ];

  return (
    <LinearGradient
      colors={[COLORS.backgroundSecondary, COLORS.background]}
      style={styles.container}
    >
      <View style={styles.logoArea}>
        <View style={styles.logoCircle}>
          <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            accessibilityLabel={item.label}
            style={[
              styles.iconButton,
              activeTab === item.id && styles.iconButtonActive,
            ]}
            onPress={() => onTabChange(item.id)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={item.icon}
              size={22}
              color={activeTab === item.id ? COLORS.primaryDark : COLORS.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          accessibilityLabel="Logout"
          style={styles.iconButton}
          onPress={onLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    width: isTablet ? scaleSize(96) : scaleSize(88),
    backgroundColor: COLORS.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
    paddingVertical: scaleSize(16),
    alignItems: 'center',
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: scaleSize(20),
  },
  logoCircle: {
    width: scaleSize(48),
    height: scaleSize(48),
    borderRadius: scaleSize(24),
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menu: {
    flex: 1,
    width: '100%',
    gap: scaleSize(10),
    alignItems: 'center',
  },
  iconButton: {
    width: scaleSize(52),
    height: scaleSize(52),
    borderRadius: scaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  footer: {
    width: '100%',
    alignItems: 'center',
  },
});