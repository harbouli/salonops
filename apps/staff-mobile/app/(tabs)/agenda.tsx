import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Plus, Clock, ShieldAlert } from 'lucide-react-native';

import { Theme } from '../../constants/theme';

const MOCK_STYLISTS = [
  { id: '1', name: 'Fatima', role: 'Coloriste Expert', isDayOff: false, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
  { id: '2', name: 'Salma', role: 'Lissage & Soins', isDayOff: false, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
  { id: '3', name: 'Youssef', role: 'Coupe & Brushing', isDayOff: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
];

const MOCK_APPOINTMENTS = [
  { id: 'a1', stylistId: '1', client: 'Meryem Bennani', service: 'Coloration Racine + Brushing', time: '10:00 - 11:45', buffer: '15 min (rinçage)', price: '350 MAD', status: 'CONFIRMED' },
  { id: 'a2', stylistId: '1', client: 'Kenza Tazi', service: 'Coupe Femme + Brushing', time: '12:00 - 12:45', buffer: '10 min', price: '150 MAD', status: 'IN_CHAIR' },
  { id: 'a3', stylistId: '2', client: 'Samira Idrissi', service: 'Lissage Protéine Caviar', time: '14:00 - 17:00', buffer: '20 min', price: '900 MAD', status: 'CONFIRMED' },
];

export default function AgendaScreen() {
  const { t } = useTranslation();
  const [selectedStylistId, setSelectedStylistId] = useState('1');

  const selectedStylist = MOCK_STYLISTS.find((s) => s.id === selectedStylistId);
  const stylistAppointments = MOCK_APPOINTMENTS.filter((a) => a.stylistId === selectedStylistId);

  return (
    <View style={styles.container}>
      {/* Stylist Selector Header */}
      <View style={styles.stylistBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.stylistScroll}>
          {MOCK_STYLISTS.map((stylist) => {
            const isSelected = stylist.id === selectedStylistId;
            return (
              <TouchableOpacity
                key={stylist.id}
                style={[styles.stylistPill, isSelected && styles.stylistPillActive]}
                onPress={() => setSelectedStylistId(stylist.id)}
              >
                <Image source={{ uri: stylist.avatar }} style={styles.stylistAvatar} />
                <View>
                  <Text style={[styles.stylistName, isSelected && styles.stylistNameActive]}>
                    {stylist.name}
                  </Text>
                  <Text style={styles.stylistRole}>
                    {stylist.isDayOff ? t('calendar.dayOff') : stylist.role}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Timeline Content */}
      <ScrollView style={styles.timeline}>
        {selectedStylist?.isDayOff ? (
          <View style={styles.dayOffBanner}>
            <ShieldAlert color={Theme.colors.accentRose} size={28} />
            <Text style={styles.dayOffText}>{selectedStylist.name} {t('calendar.dayOff')}</Text>
          </View>
        ) : (
          <View style={styles.appointmentList}>
            {stylistAppointments.map((apt) => (
              <View key={apt.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.clientName}>{apt.client}</Text>
                  <Text style={styles.price}>{apt.price}</Text>
                </View>
                <Text style={styles.serviceName}>{apt.service}</Text>
                
                <View style={styles.timeRow}>
                  <Clock size={14} color={Theme.colors.textMuted} />
                  <Text style={styles.timeText}>{apt.time}</Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>{apt.status}</Text>
                  </View>
                </View>

                {/* Buffer Block Indicator */}
                <View style={styles.bufferBlock}>
                  <Text style={styles.bufferText}>🔒 {t('calendar.buffer')} : {apt.buffer}</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addSlotBtn}>
              <Plus size={18} color="#000" />
              <Text style={styles.addSlotText}>{t('calendar.addAppointment')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  stylistBar: { backgroundColor: Theme.colors.card, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Theme.colors.border },
  stylistScroll: { paddingHorizontal: 16, gap: 12 },
  stylistPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#222228', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 24, gap: 8, borderWidth: 1, borderColor: Theme.colors.border },
  stylistPillActive: { borderColor: Theme.colors.accent, backgroundColor: '#2B271A' },
  stylistAvatar: { width: 32, height: 32, borderRadius: 16 },
  stylistName: { color: Theme.colors.textMuted, fontSize: 13, fontWeight: 'bold' },
  stylistNameActive: { color: Theme.colors.accent },
  stylistRole: { color: Theme.colors.textMuted, fontSize: 11 },
  timeline: { flex: 1, padding: 16 },
  dayOffBanner: { backgroundColor: Theme.colors.card, padding: 24, borderRadius: 16, alignItems: 'center', gap: 8, marginTop: 40 },
  dayOffText: { color: Theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  appointmentList: { gap: 16 },
  card: { backgroundColor: Theme.colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: Theme.colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  clientName: { color: Theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  price: { color: Theme.colors.accent, fontSize: 15, fontWeight: 'bold' },
  serviceName: { color: Theme.colors.textMuted, fontSize: 13, marginBottom: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeText: { color: Theme.colors.textPrimary, fontSize: 13 },
  statusBadge: { backgroundColor: '#1A3326', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginLeft: 'auto' },
  statusText: { color: Theme.colors.badgeConfirmed, fontSize: 11, fontWeight: 'bold' },
  bufferBlock: { marginTop: 12, paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#1E1E24', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: Theme.colors.accent },
  bufferText: { color: '#9CA3AF', fontSize: 11 },
  addSlotBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Theme.colors.accent, padding: 14, borderRadius: 12, gap: 8, marginTop: 12 },
  addSlotText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
});
