import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ShieldAlert, CheckCircle2, Clock, CalendarX } from 'lucide-react-native';
import { SlotValidationResult } from '../types/agenda';
import { styles } from '../styles/concurrencyGuardAlert.styles';

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
  // Component Logic & Derived Flags
  const isCollision = validation.reason === 'collision';
  const isStylistOff = validation.reason === 'stylist_off';
  const isOutOfHours = validation.reason === 'out_of_hours';

  const collisionTitle = isCollision
    ? '⚠️ Conflit de Créneau — Double-Booking Interdit'
    : isStylistOff
    ? '⚠️ Coiffeuse en Congé'
    : "⚠️ Dépassement d'Horaires";

  // Condition placed below all component logic, before final return
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

  return (
    <View style={styles.collisionContainer}>
      <View style={styles.headerRow}>
        {isStylistOff ? (
          <CalendarX size={20} color="#EF4444" />
        ) : (
          <ShieldAlert size={20} color="#EF4444" />
        )}
        <Text style={styles.collisionTitle}>{collisionTitle}</Text>
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
            {validation.conflictingAppointment.buffer
              ? ` + buffer ${validation.conflictingAppointment.buffer}m`
              : ''}
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
