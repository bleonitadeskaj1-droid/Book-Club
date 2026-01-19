import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#E8DCC4',
  background: '#f8fafc',
  card: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
};

export default function Sidebar({ userEmail, onNavigate, onLogout, onClose, activeScreen }) {
  const menuItems = [
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with user info */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.userEmail} numberOfLines={1}>
            {userEmail}
          </Text>
        </View>
      </View>

      {/* Menu items */}
      <View style={styles.menu}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            onPress={() => onNavigate(item.id)}
            style={[
              styles.menuItem,
              activeScreen === item.id && styles.activeMenuItem,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={24}
              color={activeScreen === item.id ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.menuLabel,
                activeScreen === item.id && styles.activeMenuLabel,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer with logout */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={onLogout}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out" size={24} color={COLORS.primary} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  header: {
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 16,
  },
  userSection: {
    alignItems: 'center',
  },
  avatar: {
    marginBottom: 12,
  },
  userEmail: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
  menu: {
    flex: 1,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  activeMenuItem: {
    backgroundColor: '#f0f4ff',
  },
  menuLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: 16,
    fontWeight: '500',
  },
  activeMenuLabel: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    padding: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logoutText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 16,
    fontWeight: '600',
  },
});
