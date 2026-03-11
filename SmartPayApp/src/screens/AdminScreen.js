import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSocket, BACKEND_URL } from '../context/SocketContext';
import { colors } from '../theme/colors';

export default function AdminScreen() {
  const { currentUser, logout } = useAuth();
  const { connected, lastScan, topupResult, clearTopupResult } = useSocket();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [localResult, setLocalResult] = useState(null);

  const uid = lastScan?.uid ?? '';
  const currentBalance = lastScan?.balance !== null && lastScan?.balance !== undefined
    ? `$${Number(lastScan.balance).toFixed(2)}`
    : '';

  // Listen to topup results from socket
  useEffect(() => {
    if (topupResult) {
      setLocalResult(topupResult);
      setLoading(false);
      setAmount('');
      clearTopupResult();
    }
  }, [topupResult]);

  const canTopup = !!uid && !!amount && parseFloat(amount) > 0;

  const handleTopup = async () => {
    if (!canTopup) return;
    setLoading(true);
    setLocalResult(null);
    try {
      const response = await fetch(`${BACKEND_URL}/topup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, amount: parseFloat(amount) }),
      });
      const result = await response.json();
      if (!result.success) {
        setLocalResult({ success: false, error: result.error });
        setLoading(false);
      }
      // Success handled by socket topup-success event
    } catch (error) {
      setLocalResult({ success: false, error: 'Connection error' });
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Navbar */}
      <View style={styles.navbar}>
        <View style={styles.navBrand}>
          <View style={styles.navLogo}><Text style={styles.navLogoText}>⚡</Text></View>
          <Text style={styles.navTitle}>Admin Panel</Text>
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
        <Text style={styles.pageTitle}>Top-Up Card</Text>
        <Text style={styles.pageSub}>Add balance to an RFID card</Text>

        {/* Card info */}
        {lastScan ? (
          <View style={styles.scannedCard}>
            <View style={styles.scannedRow}>
              <Text style={styles.scannedIcon}>💳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.scannedLabel}>Card Detected</Text>
                <Text style={styles.scannedUid}>{uid}</Text>
              </View>
              <View style={styles.balancePill}>
                <Text style={styles.balancePillText}>{currentBalance}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.noCardBox}>
            <Text style={styles.noCardIcon}>📡</Text>
            <Text style={styles.noCardText}>No Card Detected</Text>
            <Text style={styles.noCardSub}>Scan an RFID card to begin top-up</Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.formCard}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Card UID</Text>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>{uid || 'Auto-populated from scan'}</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Current Balance</Text>
            <View style={styles.readonlyInput}>
              <Text style={[styles.readonlyText, { color: currentBalance ? colors.success : colors.textMuted }]}>
                {currentBalance || '$0.00'}
              </Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Top-Up Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Preset amounts */}
          <View style={styles.quickAmountsRow}>
            {['5', '10', '20', '50'].map(a => (
              <TouchableOpacity
                key={a}
                style={[styles.quickBtn, amount === a && styles.quickBtnActive]}
                onPress={() => setAmount(a)}
                activeOpacity={0.8}
              >
                <Text style={[styles.quickBtnText, amount === a && styles.quickBtnTextActive]}>${a}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.topupBtn, (!canTopup || loading) && styles.topupBtnDisabled]}
            onPress={handleTopup}
            disabled={!canTopup || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.topupBtnText}>➕  Confirm Top Up</Text>
            )}
          </TouchableOpacity>

          {/* Result */}
          {localResult && (
            <View style={[styles.resultBox, localResult.success ? styles.resultSuccess : styles.resultError]}>
              {localResult.success ? (
                <>
                  <Text style={styles.resultTitle}>✅  Top-Up Successful</Text>
                  <Text style={styles.resultDetail}>+${Number(localResult.amount).toFixed(2)} added</Text>
                  <Text style={styles.resultBalance}>New Balance: ${Number(localResult.newBalance).toFixed(2)}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.resultTitle}>❌  Top-Up Failed</Text>
                  <Text style={styles.resultDetail}>{localResult.error}</Text>
                </>
              )}
            </View>
          )}
        </View>
      </ScrollView>
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
  scroll: { padding: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 4 },
  pageSub: { fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  scannedCard: { backgroundColor: colors.primaryGlow, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.primary + '44', marginBottom: 16 },
  scannedRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scannedIcon: { fontSize: 28 },
  scannedLabel: { fontSize: 11, color: colors.primary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  scannedUid: { fontSize: 15, color: colors.text, fontWeight: '700', marginTop: 2 },
  balancePill: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  balancePillText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  noCardBox: { backgroundColor: colors.surface, borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', marginBottom: 16 },
  noCardIcon: { fontSize: 36, marginBottom: 8 },
  noCardText: { fontSize: 15, color: colors.text, fontWeight: '600', marginBottom: 4 },
  noCardSub: { fontSize: 12, color: colors.textMuted },
  formCard: { backgroundColor: colors.card, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: colors.cardBorder },
  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 },
  readonlyInput: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 13 },
  readonlyText: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },
  input: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, color: colors.text, paddingHorizontal: 16, paddingVertical: 13, fontSize: 16 },
  quickAmountsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  quickBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  quickBtnActive: { backgroundColor: colors.primaryGlow, borderColor: colors.primary },
  quickBtnText: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  quickBtnTextActive: { color: colors.primary },
  topupBtn: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15, alignItems: 'center', marginBottom: 16 },
  topupBtnDisabled: { opacity: 0.4 },
  topupBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultBox: { borderRadius: 14, padding: 16, borderWidth: 1 },
  resultSuccess: { backgroundColor: colors.successBg, borderColor: colors.success + '44' },
  resultError: { backgroundColor: colors.errorBg, borderColor: colors.error + '44' },
  resultTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  resultDetail: { fontSize: 13, color: colors.textSecondary, marginBottom: 2 },
  resultBalance: { fontSize: 14, fontWeight: '700', color: colors.success },
});
