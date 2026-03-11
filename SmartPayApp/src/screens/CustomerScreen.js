import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, FlatList, StatusBar, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useSocket, BACKEND_URL } from '../context/SocketContext';
import { colors } from '../theme/colors';

export default function CustomerScreen() {
  const { logout } = useAuth();
  const { connected, lastScan, products, payResult, clearPayResult } = useSocket();
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [localResult, setLocalResult] = useState(null);

  const uid = lastScan?.uid ?? '';
  const balance = lastScan?.balance !== null && lastScan?.balance !== undefined
    ? `$${Number(lastScan.balance).toFixed(2)}` : '';

  useEffect(() => {
    if (payResult) {
      setLocalResult(payResult);
      setLoading(false);
      if (payResult.success) {
        setCart([]);
      }
      clearPayResult();
    }
  }, [payResult]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i._id === product._id);
      if (existing) return prev.map(i => i._id === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i._id !== id));

  const updateQty = (id, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i._id === id ? { ...i, quantity: i.quantity + delta } : i);
      return updated.filter(i => i.quantity > 0);
    });
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const canPay = !!uid && cart.length > 0;

  const handlePay = async () => {
    if (!canPay) return;
    setLoading(true);
    setLocalResult(null);
    try {
      const response = await fetch(`${BACKEND_URL}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          productId: cart[0]._id,
          quantity: cart.reduce((s, i) => s + i.quantity, 0),
          totalAmount: total,
        }),
      });
      const result = await response.json();
      if (!result.success) {
        setLocalResult({ success: false, reason: result.reason || result.error });
        setLoading(false);
      }
    } catch (error) {
      setLocalResult({ success: false, reason: 'Connection error' });
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
          <Text style={styles.navTitle}>Shop</Text>
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

      <View style={styles.body}>
        {/* LEFT: Products */}
        <View style={styles.productsPanel}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍  Search products..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.productsGrid}>
              {filteredProducts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyText}>No products</Text>
                </View>
              ) : filteredProducts.map(product => (
                <TouchableOpacity
                  key={product._id}
                  style={styles.productCard}
                  onPress={() => addToCart(product)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.productEmoji}>{product.emoji || '📦'}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                  <Text style={styles.productPrice}>${Number(product.price).toFixed(2)}</Text>
                  <View style={styles.addBtn}>
                    <Text style={styles.addBtnText}>+ Add</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* RIGHT: Cart */}
        <View style={styles.cartPanel}>
          <Text style={styles.cartTitle}>🛒 Cart</Text>

          {/* Card info */}
          <View style={styles.cardInfoBox}>
            <View style={styles.cardInfoRow}>
              <Text style={styles.cardInfoLabel}>Card UID</Text>
              <Text style={styles.cardInfoValue} numberOfLines={1}>{uid || '—'}</Text>
            </View>
            <View style={styles.cardInfoRow}>
              <Text style={styles.cardInfoLabel}>Balance</Text>
              <Text style={[styles.cardInfoValue, { color: colors.primary }]}>{balance || '$0.00'}</Text>
            </View>
          </View>

          {/* Cart items */}
          <ScrollView style={styles.cartScroll} showsVerticalScrollIndicator={false}>
            {cart.length === 0 ? (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyCartIcon}>🛒</Text>
                <Text style={styles.emptyCartText}>Cart is empty</Text>
                <Text style={styles.emptyCartSub}>Tap products to add</Text>
              </View>
            ) : cart.map(item => (
              <View key={item._id} style={styles.cartItem}>
                <Text style={styles.cartItemEmoji}>{item.emoji || '📦'}</Text>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>${Number(item.price).toFixed(2)}</Text>
                </View>
                <View style={styles.qtyRow}>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item._id, -1)}>
                    <Text style={styles.qtyBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.qtyNum}>{item.quantity}</Text>
                  <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item._id, 1)}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => removeFromCart(item._id)}>
                  <Text style={styles.removeBtn}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          {/* Total */}
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>

          {/* Pay button */}
          <TouchableOpacity
            style={[styles.payBtn, (!canPay || loading) && styles.payBtnDisabled]}
            onPress={handlePay}
            disabled={!canPay || loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.payBtnText}>💳  Complete Purchase</Text>}
          </TouchableOpacity>

          {/* Result */}
          {localResult && (
            <View style={[styles.resultBox, localResult.success ? styles.resultSuccess : styles.resultError]}>
              {localResult.success ? (
                <>
                  <Text style={styles.resultTitle}>✅  Payment Approved</Text>
                  <Text style={styles.resultDetail}>-${Number(localResult.amount).toFixed(2)}</Text>
                  <Text style={styles.resultBalance}>New Balance: ${Number(localResult.newBalance).toFixed(2)}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.resultTitle}>❌  Payment Declined</Text>
                  <Text style={styles.resultDetail}>{localResult.reason}</Text>
                </>
              )}
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  navBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  navLogo: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  navLogoText: { fontSize: 18 },
  navTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  connBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  connOnline: { borderColor: colors.online + '44', backgroundColor: colors.successBg },
  connOffline: { borderColor: colors.offline + '44', backgroundColor: colors.errorBg },
  connDot: { width: 6, height: 6, borderRadius: 3 },
  connText: { fontSize: 11, fontWeight: '600' },
  logoutBtn: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  logoutText: { color: colors.textSecondary, fontSize: 12, fontWeight: '600' },
  body: { flex: 1, flexDirection: 'row' },
  productsPanel: { flex: 1, padding: 12, borderRightWidth: 1, borderRightColor: colors.border },
  searchInput: {
    backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
    color: colors.text, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13, marginBottom: 12,
  },
  productsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  productCard: {
    width: '48%', backgroundColor: colors.card, borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center',
  },
  productEmoji: { fontSize: 30, marginBottom: 6 },
  productName: { fontSize: 12, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: '800', color: colors.primary, marginBottom: 8 },
  addBtn: { backgroundColor: colors.primaryGlow, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: colors.primary + '55' },
  addBtnText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  emptyState: { width: '100%', alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { fontSize: 14, color: colors.textMuted },
  cartPanel: { width: 190, padding: 12, backgroundColor: colors.surface },
  cartTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 10 },
  cardInfoBox: { backgroundColor: colors.card, borderRadius: 12, padding: 10, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  cardInfoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  cardInfoLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600' },
  cardInfoValue: { fontSize: 11, color: colors.text, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 4 },
  cartScroll: { flex: 1, marginBottom: 8 },
  emptyCart: { alignItems: 'center', padding: 20 },
  emptyCartIcon: { fontSize: 32, marginBottom: 8 },
  emptyCartText: { fontSize: 13, color: colors.text, fontWeight: '600', marginBottom: 4 },
  emptyCartSub: { fontSize: 11, color: colors.textMuted },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  cartItemEmoji: { fontSize: 20 },
  cartItemInfo: { flex: 1 },
  cartItemName: { fontSize: 11, color: colors.text, fontWeight: '600' },
  cartItemPrice: { fontSize: 10, color: colors.textMuted },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  qtyBtn: { width: 22, height: 22, borderRadius: 6, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  qtyBtnText: { color: colors.text, fontSize: 14, fontWeight: '700', lineHeight: 18 },
  qtyNum: { fontSize: 13, color: colors.text, fontWeight: '700', minWidth: 16, textAlign: 'center' },
  removeBtn: { fontSize: 14, color: colors.error, paddingHorizontal: 4 },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: colors.border, marginBottom: 8 },
  totalLabel: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },
  totalValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  payBtn: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginBottom: 10 },
  payBtnDisabled: { opacity: 0.35 },
  payBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  resultBox: { borderRadius: 10, padding: 10, borderWidth: 1 },
  resultSuccess: { backgroundColor: colors.successBg, borderColor: colors.success + '44' },
  resultError: { backgroundColor: colors.errorBg, borderColor: colors.error + '44' },
  resultTitle: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 2 },
  resultDetail: { fontSize: 11, color: colors.textSecondary },
  resultBalance: { fontSize: 12, fontWeight: '700', color: colors.success },
});
