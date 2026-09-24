import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { ShieldAlert } from 'lucide-react-native';

import { Theme } from '@/constants/theme';
import { Timeline } from '@/components/Timeline';
import { MOCK_STYLISTS, MOCK_APPOINTMENTS } from '@/mock/agendaData';
import { Stylist, Appointment } from '@/types/agenda';

export default function AgendaScreen() {
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
                    {stylist.isDayOff ? "En congé" : stylist.role}
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
          </View>
        ) : (
          <Timeline 
            appointments={stylistAppointments} 
            stylist={selectedStylist} 
          />
        )}
      </View>
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
  dayOffBanner: { backgroundColor: Theme.colors.card, margin: 16, padding: 24, borderRadius: 16, alignItems: 'center', gap: 8, marginTop: 40 },
  dayOffText: { color: Theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
});
