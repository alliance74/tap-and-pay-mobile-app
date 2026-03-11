import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Animated,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { colors } from '../theme/colors';

export default function DashboardScreen() {
  const { currentUser, currentRole, logout } = useAuth();
  const { connected, lastScan, stats } = useSocket();

  const hasCard = !!lastScan;
  const uid = lastScan?.uid ?? '--';
  const balance = lastScan?.balance !== null && lastScan?.balance !== undefined
    ? `$${Number(lastScan.balance).toFixed(2)}`
    : '$0.00';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <View style={styles.navLogo}>
            <Text style={styles.navLogoText}>⚡</Text>
          </View>
          <Text style={styles.navTitle}>Smart-Pay</Text>
        </View>
        <View style={styles.navRight}>
          <View style={[styles.connBadge, connected ? styles.connOnline : styles.connOffline]}>
            <View style={[styles.connDot, { backgroundColor: connected ? colors.online : colors.offline }]} />
            <Text style={[styles.connText, { color: connected ? colors.online : colors.offline }]}>
              {connected ? 'Live' : 'Offline'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{currentUser}</Text>
          </View>
          <View style={[styles.rolePill, currentRole === 'admin' ? styles.rolePillAdmin : styles.rolePillCustomer]}>
            <Text style={styles.roleText}>{currentRole === 'admin' ? '⚙️ Admin' : '🛒 Customer'}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard icon="💰" label="Total" value={stats.total} />
          <StatCard icon="✅" label="Success" value={stats.success} color={colors.success} />
          <StatCard icon="❌" label="Failed" value={stats.failed} color={colors.error} />
        </View>

        {/* RFID Card Visual */}
        <Text style={styles.sectionLabel}>RFID Card Status</Text>
        <View style={[styles.rfidCard, hasCard && styles.rfidCardActive]}>
          <View style={styles.rfidTop}>
            <View style={styles.chipContainer}>
              <View style={styles.chip} />
              <View style={styles.chipLines}>
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
              </View>
            </View>
            <Text style={styles.cardTypeLabel}>RFID</Text>
          </View>
          <View style={styles.rfidMiddle}>
            <Text style={styles.cardNumber}>
              {hasCard ? `${uid.substring(0,2)}** **** **** ${uid.slice(-4)}` : '**** **** **** ****'}
            </Text>
          </View>
          <View style={styles.rfidBottom}>
            <View>
              <Text style={styles.cardMetaLabel}>CARD ID</Text>
              <Text style={styles.cardMetaValue}>{uid}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.cardMetaLabel}>BALANCE</Text>
              <Text style={[styles.cardMetaValue, styles.balanceValue]}>{balance}</Text>
            </View>
          </View>
        </View>

        {/* Status */}
        {hasCard ? (
          <View style={styles.cardStatusBox}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Card ID</Text>
              <Text style={styles.statusValue}>{uid}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Balance</Text>
              <Text style={[styles.statusValue, { color: colors.success }]}>{balance}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={[styles.statusValue, { color: colors.success }]}>✓ Active</Text>
            </View>
          </View>
        ) : (
          <View style={styles.noCardBox}>
            <Text style={styles.noCardIcon}>📡</Text>
            <Text style={styles.noCardText}>Waiting for RFID scan...</Text>
            <Text style={styles.noCardSub}>Hold your card near the reader</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, color && { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, paddingTop: 50,
    backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navLogo: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  navLogoText: { fontSize: 18 },
  navTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  connBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
    borderWidth: 1,
  },
  connOnline: { borderColor: colors.online + '44', backgroundColor: colors.successBg },
  connOffline: { borderColor: colors.offline + '44', backgroundColor: colors.errorBg },
  connDot: { width: 7, height: 7, borderRadius: 4 },
  connText: { fontSize: 12, fontWeight: '600' },
  logoutBtn: {
    backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7,
    borderWidth: 1, borderColor: colors.border,
  },
  logoutText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 14, color: colors.textSecondary },
  username: { fontSize: 22, fontWeight: '700', color: colors.text, marginTop: 2 },
  rolePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  rolePillAdmin: { backgroundColor: 'rgba(255,153,0,0.15)', borderWidth: 1, borderColor: 'rgba(255,153,0,0.3)' },
  rolePillCustomer: { backgroundColor: 'rgba(34,197,94,0.12)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)' },
  roleText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: colors.card, borderRadius: 16, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: colors.cardBorder,
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginBottom: 12, letterSpacing: 0.5, textTransform: 'uppercase' },
  rfidCard: {
    borderRadius: 20, padding: 22,
    backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder,
    marginBottom: 16,
  },
  rfidCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#1E1A0E',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  rfidTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  chipContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: {
    width: 36, height: 28, borderRadius: 5, backgroundColor: colors.primary,
    opacity: 0.9,
  },
  chipLines: { gap: 4 },
  chipLine: { height: 2, width: 18, backgroundColor: colors.primary, borderRadius: 1, opacity: 0.5 },
  cardTypeLabel: { fontSize: 12, color: colors.textMuted, fontWeight: '700', letterSpacing: 2 },
  rfidMiddle: { marginBottom: 18 },
  cardNumber: { fontSize: 16, color: colors.text, letterSpacing: 3, fontWeight: '600' },
  rfidBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  cardMetaLabel: { fontSize: 9, color: colors.textMuted, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  cardMetaValue: { fontSize: 13, color: colors.text, fontWeight: '600', marginTop: 3 },
  balanceValue: { color: colors.primary },
  cardStatusBox: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: colors.border, marginBottom: 16,
  },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.border },
  statusLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  statusValue: { fontSize: 13, color: colors.text, fontWeight: '600' },
  noCardBox: {
    backgroundColor: colors.surface, borderRadius: 16, padding: 32,
    alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed',
  },
  noCardIcon: { fontSize: 48, marginBottom: 12 },
  noCardText: { fontSize: 16, color: colors.text, fontWeight: '600', marginBottom: 6 },
  noCardSub: { fontSize: 13, color: colors.textMuted },
});
