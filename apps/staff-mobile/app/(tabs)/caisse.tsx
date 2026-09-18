import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Banknote, CreditCard, Split, CheckCircle2 } from 'lucide-react-native';

import { Theme } from '../../constants/theme';

export default function CaisseScreen() {
  const { t } = useTranslation();
  const [method, setMethod] = useState<'cash' | 'card' | 'split'>('cash');
  const [tip, setTip] = useState(20);
  const servicePrice = 350;
  const total = servicePrice + tip;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Ticket Summary */}
        <View style={styles.receiptCard}>
          <Text style={styles.receiptTitle}>Encaisser au Fauteuil</Text>
          <Text style={styles.clientSubtitle}>Meryem Bennani • Coiffée par Fatima</Text>

          <View style={styles.divider} />

          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Coloration Racine + Brushing</Text>
            <Text style={styles.lineValue}>{servicePrice} MAD</Text>
          </View>

          <View style={styles.lineRow}>
            <Text style={styles.lineLabel}>Pourboire attribué à Fatima</Text>
            <Text style={[styles.lineValue, { color: Theme.colors.accent }]}>+{tip} MAD</Text>
          </View>

          <View style={styles.tipSelector}>
            {[0, 10, 20, 30, 50].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[styles.tipBtn, tip === amount && styles.tipBtnActive]}
                onPress={() => setTip(amount)}
              >
                <Text style={[styles.tipBtnText, tip === amount && styles.tipBtnTextActive]}>
                  {amount === 0 ? 'Sans' : `+${amount} DH`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total à Régler</Text>
            <Text style={styles.totalValue}>{total} MAD</Text>
          </View>
        </View>

        {/* Payment Method Selector */}
        <Text style={styles.sectionHeader}>Mode de Paiement</Text>
        <View style={styles.methodGrid}>
          <TouchableOpacity
            style={[styles.methodBtn, method === 'cash' && styles.methodBtnActive]}
            onPress={() => setMethod('cash')}
          >
            <Banknote size={24} color={method === 'cash' ? '#000' : Theme.colors.textMuted} />
            <Text style={[styles.methodText, method === 'cash' && styles.methodTextActive]}>Espèces</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodBtn, method === 'card' && styles.methodBtnActive]}
            onPress={() => setMethod('card')}
          >
            <CreditCard size={24} color={method === 'card' ? '#000' : Theme.colors.textMuted} />
            <Text style={[styles.methodText, method === 'card' && styles.methodTextActive]}>TPE / Carte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodBtn, method === 'split' && styles.methodBtnActive]}
            onPress={() => setMethod('split')}
          >
            <Split size={24} color={method === 'split' ? '#000' : Theme.colors.textMuted} />
            <Text style={[styles.methodText, method === 'split' && styles.methodTextActive]}>Mixte / Split</Text>
          </TouchableOpacity>
        </View>

        {/* Action Confirm */}
        <TouchableOpacity style={styles.payBtn}>
          <CheckCircle2 size={20} color="#000" />
          <Text style={styles.payBtnText}>Confirmer Encaissement ({total} MAD)</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 16 },
  receiptCard: { backgroundColor: Theme.colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Theme.colors.border },
  receiptTitle: { color: Theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  clientSubtitle: { color: Theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 16 },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  lineLabel: { color: Theme.colors.textMuted, fontSize: 14 },
  lineValue: { color: Theme.colors.textPrimary, fontSize: 14, fontWeight: '500' },
  tipSelector: { flexDirection: 'row', gap: 8, marginVertical: 8 },
  tipBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: '#222228', alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.border },
  tipBtnActive: { backgroundColor: Theme.colors.accent, borderColor: Theme.colors.accent },
  tipBtnText: { color: Theme.colors.textMuted, fontSize: 11, fontWeight: 'bold' },
  tipBtnTextActive: { color: '#000' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { color: Theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  totalValue: { color: Theme.colors.accent, fontSize: 22, fontWeight: 'bold' },
  sectionHeader: { color: Theme.colors.textMuted, fontSize: 13, fontWeight: 'bold', marginTop: 24, marginBottom: 12, textTransform: 'uppercase' },
  methodGrid: { flexDirection: 'row', gap: 10 },
  methodBtn: { flex: 1, backgroundColor: Theme.colors.card, paddingVertical: 18, borderRadius: 12, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Theme.colors.border },
  methodBtnActive: { backgroundColor: Theme.colors.accent, borderColor: Theme.colors.accent },
  methodText: { color: Theme.colors.textMuted, fontSize: 12, fontWeight: 'bold' },
  methodTextActive: { color: '#000' },
  payBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.accent, padding: 16, borderRadius: 12, gap: 8, marginTop: 30 },
  payBtnText: { color: '#000', fontWeight: 'bold', fontSize: 15 },
});
