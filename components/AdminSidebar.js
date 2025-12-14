import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const AdminSidebar = ({
  visible,
  onClose,
  userId,
  logout,
  // Navigation
  onSwitchToBookList,
  onSwitchToAdmin,
  // Admin Profile state
  showAdminProfile,
  setShowAdminProfile,
  profileName,
  setProfileName,
  profileEmail,
  setProfileEmail,
  avatarUrl,
  setAvatarUrl,
  saveProfile,
  pickImage,
  takePhoto,
  books = [],
  // User Management state
  showUserManagement,
  setShowUserManagement,
  users,
  loadingUsers,
  fetchUsers,
  deleteUser,
  // Styles
  styles
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.sidebarOverlay}>
        <View style={styles.sidebarContent}>
          <View style={styles.sidebarHeader}>
            <Text style={styles.sidebarTitle}>Admin Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.sidebarCloseButton}>
              <Text style={styles.sidebarClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Navigation Section */}
            <View style={styles.sidebarSection}>
              
              {onSwitchToBookList && (
                <TouchableOpacity
                  style={styles.sidebarMenuItem}
                  onPress={() => {
                    onClose();
                  }}
                >
                  <Text style={styles.sidebarMenuText}>📚 Book Club</Text>
                  <Text style={styles.sidebarMenuArrow}>→</Text>
                </TouchableOpacity>
              )}
              
              {onSwitchToAdmin && (
                <TouchableOpacity
                  style={styles.sidebarMenuItem}
                  onPress={() => {
                    onClose();
                    onSwitchToAdmin();
                  }}
                >
                  <Text style={styles.sidebarMenuText}>⚙️ Admin Console</Text>
                  <Text style={styles.sidebarMenuArrow}>→</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Admin Profile Section */}
            <View style={styles.sidebarSection}>
              <TouchableOpacity
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setShowAdminProfile(!showAdminProfile);
                  setShowUserManagement(false);
                }}
              >
                <Text style={styles.sidebarMenuText}>👤 Admin Profile</Text>
                <Text style={styles.sidebarMenuArrow}>{showAdminProfile ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {showAdminProfile && (
                <View style={styles.sidebarSubContent}>
                  <View style={styles.avatarContainer}>
                    <TouchableOpacity style={styles.avatar} onPress={pickImage}>
                      {avatarUrl ? (
                        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
                      ) : (
                        <Text style={styles.avatarText}>{(profileName || userId || 'A').charAt(0).toUpperCase()}</Text>
                      )}
                    </TouchableOpacity>
                    <View style={styles.avatarButtons}>
                      <TouchableOpacity style={styles.avatarActionButton} onPress={pickImage}>
                        <Text style={styles.avatarActionText}>📷 Gallery</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.avatarActionButton} onPress={takePhoto}>
                        <Text style={styles.avatarActionText}>📸 Camera</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.profileUsername}>{userId}</Text>
                  </View>

                  <View style={styles.profileForm}>
                    <Text style={styles.profileLabel}>Display Name</Text>
                    <TextInput
                      placeholder="Type 'admin'"
                      placeholderTextColor="#94a3b8"
                      value={profileName}
                      onChangeText={setProfileName}
                      style={styles.profileInput}
                    />

                    <Text style={styles.profileLabel}>Email</Text>
                    <TextInput
                      placeholder="your.email@example.com"
                      placeholderTextColor="#94a3b8"
                      value={profileEmail}
                      onChangeText={setProfileEmail}
                      style={styles.profileInput}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />

                    <TouchableOpacity style={styles.profileSaveButton} onPress={saveProfile}>
                      <Text style={styles.profileSaveText}>Save Changes</Text>
                    </TouchableOpacity>

                    <View style={styles.profileStats}>
                      <Text style={styles.statsTitle}>Admin Stats</Text>
                      <Text style={styles.statsText}>Total Books: {books.length}</Text>
                      <Text style={styles.statsText}>Favorites: {books.filter(b => b.favorite).length}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            {/* User Management Section */}
            <View style={styles.sidebarSection}>
              <TouchableOpacity
                style={styles.sidebarMenuItem}
                onPress={() => {
                  setShowUserManagement(!showUserManagement);
                  setShowAdminProfile(false);
                  if (!showUserManagement) fetchUsers();
                }}
              >
                <Text style={styles.sidebarMenuText}>👥 User Management</Text>
                <Text style={styles.sidebarMenuArrow}>{showUserManagement ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {showUserManagement && (
                <View style={styles.sidebarSubContent}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={styles.sectionTitle}>User Management</Text>
                    <TouchableOpacity onPress={fetchUsers} style={{ padding: 8 }}>
                      <Text style={[styles.link, { fontSize: 12 }]}>🔄 Refresh</Text>
                    </TouchableOpacity>
                  </View>

                  {loadingUsers ? (
                    <ActivityIndicator size="small" color="#67e8f9" style={{ marginVertical: 10 }} />
                  ) : users.length === 0 ? (
                    <Text style={styles.emptyUsers}>No users found. Check Supabase profiles table.</Text>
                  ) : (
                    <View>
                      <Text style={{ color: '#94a3b8', marginBottom: 12 }}>Total Users: {users.length}</Text>
                      {users.map((user, idx) => (
                        <View key={user.id || idx} style={styles.userCard}>
                          <View style={styles.userInfo}>
                            <View style={[styles.userAvatarSmall, user.role === 'admin' ? { backgroundColor: '#f59e0b' } : {}]}>
                              <Text style={styles.userAvatarSmallText}>
                                {(user.name || user.user_id || 'U').charAt(0).toUpperCase()}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                <Text style={styles.userName}>{user.name || 'No name'}</Text>
                                <View style={[styles.roleBadge, user.role === 'admin' ? { backgroundColor: '#f59e0b' } : { backgroundColor: '#3b82f6' }]}>
                                  <Text style={styles.roleBadgeText}>{user.roleLabel || user.role}</Text>
                                </View>
                              </View>
                              <Text style={styles.userEmail}>{user.userEmail}</Text>
                            </View>
                          </View>
                          <TouchableOpacity
                            style={styles.deleteUserButton}
                            onPress={() => deleteUser(user.id)}
                          >
                            <Text style={styles.deleteUserText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>

          {logout ? (
            <TouchableOpacity style={styles.sidebarLogout} onPress={() => { onClose(); logout(); }}>
              <Text style={styles.sidebarLogoutText}>Logout</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

export default AdminSidebar;