import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Theme } from '@/constants/theme';
import { MOCK_STYLISTS } from '@/mock/agendaData';

export default function NewAppointmentScreen() {
  const { stylistId, time } = useLocalSearchParams<{ stylistId: string; time: string }>();
  
  const stylist = MOCK_STYLISTS.find(s => s.id === stylistId);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveau Rendez-vous</Text>
      <View style={styles.card}>
        <Text style={styles.text}>Styliste: {stylist?.name}</Text>
        <Text style={styles.text}>Heure: {time}</Text>
        <Text style={styles.placeholder}>(Formulaire complet à implémenter par l'API)</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, padding: 16, paddingTop: 40 },
  title: { color: Theme.colors.textPrimary, fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  card: { backgroundColor: Theme.colors.card, padding: 16, borderRadius: 12 },
  text: { color: Theme.colors.textPrimary, fontSize: 16, marginBottom: 8 },
  placeholder: { color: Theme.colors.textMuted, fontSize: 14, fontStyle: 'italic', marginTop: 16 }
});
