import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Calculator, TrendingUp, CheckCircle, Shield } from 'lucide-react-native';

import { Theme } from '../../constants/theme';

export default function PitchScreen() {
  const { t } = useTranslation();
  const [dailyClients, setDailyClients] = useState(15);
  const [avgTicket, setAvgTicket] = useState(150);
  const [noShowsWeek, setNoShowsWeek] = useState(3);

  const monthlyLostRevenue = noShowsWeek * avgTicket * 4;
  const subscriptionCost = 350; // MAD / month
  const daysToBreakeven = Math.ceil((subscriptionCost / (monthlyLostRevenue / 30)) || 5);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Title */}
        <View style={styles.header}>
          <Calculator color={Theme.colors.accent} size={28} />
          <Text style={styles.title}>{t('pitch.title')}</Text>
          <Text style={styles.subtitle}>Faites le calcul en direct devant le propriétaire</Text>
        </View>

        {/* Sliders Box */}
        <View style={styles.calcCard}>
          {/* Daily Clients */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>{t('pitch.dailyClients')}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setDailyClients(Math.max(5, dailyClients - 5))}>
                <Text style={styles.stepText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{dailyClients}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setDailyClients(dailyClients + 5)}>
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Average Ticket */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>{t('pitch.avgTicket')}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setAvgTicket(Math.max(50, avgTicket - 25))}>
                <Text style={styles.stepText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{avgTicket} DH</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setAvgTicket(avgTicket + 25)}>
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekly No-Shows */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>{t('pitch.noShowsWeek')}</Text>
            <View style={styles.stepper}>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setNoShowsWeek(Math.max(1, noShowsWeek - 1))}>
                <Text style={styles.stepText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{noShowsWeek}</Text>
              <TouchableOpacity style={styles.stepBtn} onPress={() => setNoShowsWeek(noShowsWeek + 1)}>
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Dynamic Result Banner */}
          <View style={styles.resultBox}>
            <Text style={styles.resultLabel}>{t('pitch.monthlyLoss')}</Text>
            <Text style={styles.resultValue}>{monthlyLostRevenue.toLocaleString()} MAD / mois</Text>
            <Text style={styles.resultFormula}>
              ({noShowsWeek} lapins × {avgTicket} DH × 4 semaines)
            </Text>
          </View>
        </View>

        {/* ROI Pitch Card */}
        <View style={styles.roiCard}>
          <TrendingUp color="#10B981" size={24} />
          <View style={{ flex: 1 }}>
            <Text style={styles.roiTitle}>L'abonnement SalonOps est de 350 DH / mois</Text>
            <Text style={styles.roiText}>
              En éliminant les no-shows grâce aux rappels WhatsApp à 24h et 2h, vous rentabilisez l'outil en seulement <Text style={{ color: Theme.colors.accent, fontWeight: 'bold' }}>{daysToBreakeven} jours</Text>.
            </Text>
          </View>
        </View>

        {/* Two Pitch Killers */}
        <Text style={styles.pitchHeader}>2 Arguments Décisifs pour Fermer la Vente</Text>

        <View style={styles.pitchCard}>
          <CheckCircle size={20} color={Theme.colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pitchCardTitle}>1. Les Rappels WhatsApp à 24h et 2h</Text>
            <Text style={styles.pitchCardBody}>
              "Au Maroc, WhatsApp a 98% de taux d'ouverture. Vos clientes cliquent sur 'Confirmer'. Les oublis chutent de 80%."
            </Text>
          </View>
        </View>

        <View style={styles.pitchCard}>
          <Shield size={20} color={Theme.colors.accent} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pitchCardTitle}>2. Le Secret de la Fiche Technique</Text>
            <Text style={styles.pitchCardBody}>
              "Votre historique de formules couleur et de photos ne part plus jamais avec une employée qui démissionne."
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  content: { padding: 16 },
  header: { alignItems: 'center', marginBottom: 20, gap: 6 },
  title: { color: Theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  subtitle: { color: Theme.colors.textMuted, fontSize: 12 },
  calcCard: { backgroundColor: Theme.colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: Theme.colors.border },
  controlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  controlLabel: { color: Theme.colors.textPrimary, fontSize: 14, fontWeight: '500' },
  stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222228', borderRadius: 8, padding: 4, gap: 12 },
  stepBtn: { width: 32, height: 32, backgroundColor: '#2E2E36', borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: Theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  controlValue: { color: Theme.colors.accent, fontSize: 14, fontWeight: 'bold', minWidth: 45, textAlign: 'center' },
  divider: { height: 1, backgroundColor: Theme.colors.border, marginVertical: 16 },
  resultBox: { backgroundColor: '#2B1A1E', padding: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Theme.colors.accentRose },
  resultLabel: { color: '#FECDD3', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  resultValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginVertical: 4 },
  resultFormula: { color: '#F43F5E', fontSize: 11 },
  roiCard: { flexDirection: 'row', backgroundColor: '#13281E', padding: 16, borderRadius: 12, marginTop: 16, gap: 12, borderWidth: 1, borderColor: '#10B981', alignItems: 'center' },
  roiTitle: { color: '#A7F3D0', fontSize: 13, fontWeight: 'bold' },
  roiText: { color: '#D1FAE5', fontSize: 12, marginTop: 4, lineHeight: 18 },
  pitchHeader: { color: Theme.colors.textMuted, fontSize: 13, fontWeight: 'bold', marginTop: 24, marginBottom: 12, textTransform: 'uppercase' },
  pitchCard: { flexDirection: 'row', backgroundColor: Theme.colors.card, padding: 16, borderRadius: 12, marginBottom: 12, gap: 12, borderWidth: 1, borderColor: Theme.colors.border },
  pitchCardTitle: { color: Theme.colors.accent, fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  pitchCardBody: { color: Theme.colors.textMuted, fontSize: 12, lineHeight: 18 },
});
