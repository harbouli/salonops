import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldAlert, Plus, Calendar } from 'lucide-react-native';

import { Theme } from '@/constants/theme';
import { Timeline } from '@/components/Timeline';
import { MOCK_STYLISTS, useAppointments } from '@/mock/agendaData';
import { Stylist } from '@/types/agenda';

export default function AgendaScreen() {
  const router = useRouter();
  const [selectedStylistId, setSelectedStylistId] = useState('1');

  const selectedStylist = MOCK_STYLISTS.find((s) => s.id === selectedStylistId);
  const { appointments: stylistAppointments } = useAppointments(selectedStylistId);

  const handleOpenNewAppointment = () => {
    if (!selectedStylist) return;
    router.push(`/new-appointment?stylistId=${selectedStylist.id}&time=10:00`);
  };

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
                    {stylist.isDayOff ? 'En congé' : stylist.role}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Timeline Content */}
      <View style={styles.timelineContainer}>
        {selectedStylist?.isDayOff ? (
          <View style={styles.dayOffBanner}>
            <ShieldAlert color={Theme.colors.accentRose} size={28} />
            <Text style={styles.dayOffText}>{selectedStylist.name} est en congé aujourd'hui</Text>
            <Text style={styles.dayOffSubtext}>Les réservations sont bloquées pour cette journée.</Text>
          </View>
        ) : (
          <Timeline 
            appointments={stylistAppointments} 
            stylist={selectedStylist} 
          />
        )}
      </View>

      {/* Floating Action Button for Booking */}
      {!selectedStylist?.isDayOff && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleOpenNewAppointment}
          activeOpacity={0.85}
        >
          <Plus size={22} color="#000" />
          <Text style={styles.fabText}>Nouveau RDV</Text>
        </TouchableOpacity>
      )}
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
  timelineContainer: { flex: 1 },
  dayOffBanner: { backgroundColor: Theme.colors.card, margin: 16, padding: 24, borderRadius: 16, alignItems: 'center', gap: 8, marginTop: 40, borderWidth: 1, borderColor: '#7F1D1D' },
  dayOffText: { color: Theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  dayOffSubtext: { color: Theme.colors.textMuted, fontSize: 13, marginTop: 4 },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: Theme.colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 30,
    gap: 8,
    shadowColor: Theme.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  fabText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
