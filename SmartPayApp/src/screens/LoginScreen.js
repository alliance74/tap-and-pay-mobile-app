import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

const ROLES = [
  { value: 'admin', label: '👤 Admin' },
  { value: 'customer', label: '🛒 Customer' },
];

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(username.trim(), password, role);
      if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    }, 400);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />

        <View style={styles.card}>
          {/* Logo */}
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Text style={styles.logoEmoji}>⚡</Text>
            </View>
            <View>
              <Text style={styles.logoTitle}>Smart-Pay</Text>
              <Text style={styles.logoSubtitle}>Secure RFID Payment System</Text>
            </View>
          </View>

          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.welcomeSub}>Sign in to continue</Text>

          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>👤  Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your username"
              placeholderTextColor={colors.textMuted}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🔒  Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Role selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>🎭  Role</Text>
            <View style={styles.roleRow}>
              {ROLES.map(r => (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleBtn, role === r.value && styles.roleBtnActive]}
                  onPress={() => setRole(r.value)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.roleBtnText, role === r.value && styles.roleBtnTextActive]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Error */}
          {!!error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          )}

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signInText}>Sign In  →</Text>
            )}
          </TouchableOpacity>

          {/* Demo hint */}
          <View style={styles.hintBox}>
            <Text style={styles.hintText}>Demo: admin / admin123 or customer / customer123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 60,
  },
  circle1: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: 'rgba(255,153,0,0.08)',
  },
  circle2: {
    position: 'absolute', bottom: 80, left: -80,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(255,107,0,0.06)',
  },
  circle3: {
    position: 'absolute', top: 200, left: -40,
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,153,0,0.05)',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  logoIcon: {
    width: 52, height: 52, borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  logoEmoji: { fontSize: 26 },
  logoTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  logoSubtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  welcomeText: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: colors.textSecondary, marginBottom: 24 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
  },
  roleRow: { flexDirection: 'row', gap: 12 },
  roleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: colors.primaryGlow,
    borderColor: colors.primary,
  },
  roleBtnText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  roleBtnTextActive: { color: colors.primary },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderRadius: 10, padding: 12, marginBottom: 16,
    borderWidth: 1, borderColor: colors.error + '33',
  },
  errorText: { color: colors.error, fontSize: 13, fontWeight: '500' },
  signInBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14, paddingVertical: 15,
    alignItems: 'center', marginBottom: 16,
  },
  signInBtnDisabled: { opacity: 0.6 },
  signInText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  hintBox: {
    backgroundColor: colors.surface,
    borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: colors.border,
  },
  hintText: { color: colors.textMuted, fontSize: 12, textAlign: 'center' },
});
