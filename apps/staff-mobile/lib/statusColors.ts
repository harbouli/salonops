import { Theme } from '../constants/theme';
import { AppointmentStatus } from '../types/agenda';

/**
 * Returns the theme color associated with an appointment status.
 */
export function getStatusColor(status: AppointmentStatus): string {
  switch (status) {
    case 'CONFIRMED':
      return Theme.colors.badgeConfirmed;
    case 'IN_CHAIR':
      return Theme.colors.badgeInChair;
    case 'COMPLETED':
      return Theme.colors.textMuted;
    case 'CANCELLED':
      return Theme.colors.accentRose;
    default:
      return Theme.colors.accent;
  }
}

/**
 * Returns a human-friendly French label for an appointment status.
 */
export function getStatusLabel(status: AppointmentStatus): string {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmé';
    case 'IN_CHAIR':
      return 'Au fauteuil';
    case 'COMPLETED':
      return 'Terminé';
    case 'CANCELLED':
      return 'Annulé';
    default:
      return status;
  }
}
