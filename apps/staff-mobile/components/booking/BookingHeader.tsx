import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, X } from 'lucide-react-native';
import { Theme } from '../../constants/theme';
import { styles } from '../../styles/newAppointment.styles';

interface BookingHeaderProps {
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const BookingHeader: React.FC<BookingHeaderProps> = ({
  onClose,
  title = 'Nouveau Rendez-vous',
  subtitle = 'Réservation avec buffer de sécurité & garde anti-collision',
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onClose}
        style={styles.closeBtn}
        accessibilityLabel="Fermer"
      >
        <ChevronLeft size={22} color={Theme.colors.textPrimary} />
      </TouchableOpacity>
      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeCrossBtn}>
        <X size={20} color={Theme.colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
};
