import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import { MOCK_APPOINTMENTS } from '@/mock/agendaData';

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Détails de la Visite</Text>
      <View style={styles.card}>
        <Text style={styles.text}>Client: {appointment.client}</Text>
        <Text style={styles.text}>Service: {appointment.service}</Text>
        <Text style={styles.text}>Statut: {appointment.status}</Text>
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
});
