import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ShieldAlert, CheckCircle2, Clock, CalendarX } from 'lucide-react-native';
import { SlotValidationResult } from '../types/agenda';

interface ConcurrencyGuardAlertProps {
  validation: SlotValidationResult;
  onSelectNextFreeSlot?: (slot: string) => void;
  stylistName?: string;
}

export const ConcurrencyGuardAlert: React.FC<ConcurrencyGuardAlertProps> = ({
  validation,
  onSelectNextFreeSlot,
  stylistName,
}) => {
  if (validation.isValid) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.headerRow}>
          <CheckCircle2 size={18} color="#10B981" />
          <Text style={styles.successTitle}>Créneau Disponible & Conforme</Text>
        </View>
        <Text style={styles.successMessage}>{validation.message}</Text>
      </View>
    );
  }

  const isCollision = validation.reason === 'collision';
  const isStylistOff = validation.reason === 'stylist_off';
  const isOutOfHours = validation.reason === 'out_of_hours';

  return (
    <View style={styles.collisionContainer}>
      <View style={styles.headerRow}>
        {isStylistOff ? (
          <CalendarX size={20} color="#EF4444" />
        ) : (
          <ShieldAlert size={20} color="#EF4444" />
        )}
        <Text style={styles.collisionTitle}>
          {isCollision
            ? '⚠️ Conflit de Créneau — Double-Booking Interdit'
            : isStylistOff
            ? '⚠️ Coiffeuse en Congé'
            : '⚠️ Dépassement d\'Horaires'}
        </Text>
      </View>

      <Text style={styles.collisionMessage}>{validation.message}</Text>

      {/* Conflicting Appointment Details Pill */}
      {validation.conflictingAppointment && (
        <View style={styles.conflictCard}>
          <Text style={styles.conflictCardTitle}>Rendez-vous en conflit :</Text>
          <View style={styles.conflictRow}>
            <Text style={styles.conflictClient}>
              {validation.conflictingAppointment.client}
            </Text>
            <Text style={styles.conflictTime}>
              {validation.conflictingAppointment.startTime} - {validation.conflictingAppointment.endTime}
            </Text>
          </View>
          <Text style={styles.conflictService}>
            {validation.conflictingAppointment.service}
            {validation.conflictingAppointment.buffer ? ` + buffer ${validation.conflictingAppointment.buffer}m` : ''}
          </Text>
        </View>
      )}

      {/* Quick Action Button to jump to next free slot */}
      {validation.nextAvailableSlot && onSelectNextFreeSlot && (
        <TouchableOpacity
          style={styles.suggestionButton}
          onPress={() => onSelectNextFreeSlot(validation.nextAvailableSlot!)}
          activeOpacity={0.8}
        >
          <Clock size={14} color="#000" />
          <Text style={styles.suggestionButtonText}>
            Déplacer au prochain créneau libre ({validation.nextAvailableSlot})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  successTitle: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: 'bold',
  },
  successMessage: {
    color: '#D1FAE5',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16,
  },
  collisionContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collisionTitle: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 1,
  },
  collisionMessage: {
    color: '#FEE2E2',
    fontSize: 12,
    marginTop: 6,
    lineHeight: 17,
  },
  conflictCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  conflictCardTitle: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  conflictRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conflictClient: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  conflictTime: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
  },
  conflictService: {
    color: '#E5E7EB',
    fontSize: 11,
    marginTop: 2,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBBF24',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    marginTop: 10,
  },
  suggestionButtonText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
