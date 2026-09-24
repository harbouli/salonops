import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock } from 'lucide-react-native';
import { Theme } from '@/constants/theme';
import { AppointmentBlockProps } from '@/types/agenda';

const MINUTE_HEIGHT = 80 / 60;

export const AppointmentBlock = ({ appointment, top, height }: AppointmentBlockProps) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/visit-details?id=${appointment.id}`);
  };

  const bufferHeight = appointment.buffer ? parseInt(appointment.buffer) * MINUTE_HEIGHT : 0;
  
  const getStatusColor = () => {
    switch (appointment.status) {
      case 'CONFIRMED': return Theme.colors.badgeConfirmed;
      case 'IN_CHAIR': return Theme.colors.badgeInChair;
      case 'COMPLETED': return Theme.colors.textMuted;
      case 'CANCELLED': return Theme.colors.accentRose;
      default: return Theme.colors.accent;
    }
  };

  const statusColor = getStatusColor();

  return (
    <TouchableOpacity 
      style={[styles.block, { top, height: height + bufferHeight }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={[styles.blockInner, { height: height - 2, borderLeftColor: statusColor }]}>
        <View style={styles.header}>
          <Text style={styles.clientName} numberOfLines={1}>{appointment.client}</Text>
          <Text style={styles.price}>{appointment.price}</Text>
        </View>
        <Text style={styles.serviceName} numberOfLines={1}>{appointment.service}</Text>
        
        <View style={styles.timeRow}>
          <Clock size={12} color={Theme.colors.textMuted} />
          <Text style={styles.timeText}>{appointment.startTime} - {appointment.endTime}</Text>
        </View>
      </View>

      {appointment.buffer && bufferHeight > 0 && (
        <View style={[styles.bufferBlock, { height: bufferHeight }]}>
          <Text style={styles.bufferBlockText}>🔒 +{appointment.buffer} min buffer (rinçage / nettoyage)</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    left: 0,
    right: 0,
    paddingHorizontal: 2,
    paddingVertical: 1,
  },
  blockInner: {
    flex: 1,
    backgroundColor: Theme.colors.card,
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.accent,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  clientName: {
    color: Theme.colors.textPrimary,
    fontSize: 14,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  price: {
    color: Theme.colors.accent,
    fontSize: 13,
    fontWeight: 'bold',
  },
  serviceName: {
    color: Theme.colors.textMuted,
    fontSize: 12,
    marginBottom: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    color: Theme.colors.textMuted,
    fontSize: 11,
  },
  bufferBlock: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.badgeBuffer,
    borderRightWidth: 1,
    borderRightColor: Theme.colors.border,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: -2,
    zIndex: -1,
  },
  bufferBlockText: {
    color: Theme.colors.textMuted,
    fontSize: 10,
    fontStyle: 'italic',
  }
});
