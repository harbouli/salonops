import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import { MOCK_APPOINTMENTS } from '@/mock/agendaData';

import { getStatusColor, getStatusLabel } from '@/lib/statusColors';

export default function VisitDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const appointment = MOCK_APPOINTMENTS.find(a => a.id === id);

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Rendez-vous introuvable.</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(appointment.status);
  const statusLabel = getStatusLabel(appointment.status);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails de la Visite</Text>
      <View style={styles.card}>
        <Text style={styles.text}>Client: {appointment.client}</Text>
        <Text style={styles.text}>Service: {appointment.service}</Text>
        <View style={styles.statusRow}>
          <Text style={styles.text}>Statut: </Text>
          <View style={[styles.statusBadge, { borderColor: statusColor, backgroundColor: `${statusColor}18` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.text}>Prix: {appointment.price}</Text>
        <Text style={styles.text}>Heure: {appointment.startTime} - {appointment.endTime}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, padding: 16, paddingTop: 40 },
  title: { color: Theme.colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: Theme.colors.card, padding: 16, borderRadius: 12 },
  text: { color: Theme.colors.textMuted, fontSize: 16, marginBottom: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 2, borderRadius: 6, borderWidth: 1 },
  statusText: { fontSize: 14, fontWeight: 'bold' },
});
