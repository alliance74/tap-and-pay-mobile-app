import React from 'react';
import {
  View, Text, FlatList, StyleSheet, StatusBar, TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { colors } from '../theme/colors';

function getLogStyle(text) {
  if (text.includes('✓') || text.includes('✅')) return { color: colors.success };
  if (text.includes('✗') || text.includes('❌')) return { color: colors.error };
  if (text.includes('🔍')) return { color: colors.primary };
  if (text.includes('📊')) return { color: '#60A5FA' };
  return { color: colors.textSecondary };
}

export default function HistoryScreen() {
  const { logout } = useAuth();
  const { connected, logs } = useSocket();

  const renderItem = ({ item, index }) => {
    const timeStr = item.time.toLocaleTimeString('en-US', {
      hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    return (
      <View style={[styles.logItem, index === 0 && styles.logItemFirst]}>
        <View style={styles.logTimeBox}>
          <Text style={styles.logTime}>{timeStr}</Text>
        </View>
        <Text style={[styles.logText, getLogStyle(item.text)]} numberOfLines={2}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <View style={styles.navLogo}><Text style={styles.navLogoText}>⚡</Text></View>
          <Text style={styles.navTitle}>History</Text>
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

      {/* Header */}
      <View style={styles.histHeader}>
        <View>
          <Text style={styles.histTitle}>Transaction Log</Text>
          <Text style={styles.histSub}>Real-time system activity</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{logs.length}</Text>
        </View>
      </View>

      {/* Log list */}
      {logs.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No activity yet</Text>
          <Text style={styles.emptySub}>Transactions will appear here in real-time</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14, paddingTop: 50,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navLogo: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  navLogoText: { fontSize: 18 },
  navTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  connBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  connOnline: { borderColor: colors.online + '44', backgroundColor: colors.successBg },
  connOffline: { borderColor: colors.offline + '44', backgroundColor: colors.errorBg },
  connDot: { width: 7, height: 7, borderRadius: 4 },
  connText: { fontSize: 12, fontWeight: '600' },
  logoutBtn: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: colors.border },
  logoutText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  histHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.surface,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  histTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  histSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  countBadge: {
    backgroundColor: colors.primaryGlow, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6,
    borderWidth: 1, borderColor: colors.primary + '44',
  },
  countText: { color: colors.primary, fontSize: 15, fontWeight: '800' },
  list: { padding: 16, paddingBottom: 40 },
  logItem: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border + '66',
  },
  logItemFirst: { borderTopWidth: 0 },
  logTimeBox: {
    backgroundColor: colors.surface, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: colors.border, minWidth: 68, alignItems: 'center',
  },
  logTime: { fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', fontWeight: '600' },
  logText: { flex: 1, fontSize: 13, fontWeight: '500', paddingTop: 2 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  emptySub: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
});
