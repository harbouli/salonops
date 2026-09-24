export type AppointmentStatus = 'CONFIRMED' | 'IN_CHAIR' | 'COMPLETED' | 'CANCELLED';

export interface Stylist {
  id: string;
  name: string;
  role: string;
  isDayOff: boolean;
  avatar: string;
}

export interface SalonService {
  id: string;
  name: string;
  nameAr?: string;
  category: 'coupe' | 'coloration' | 'lissage' | 'brushing' | 'soin';
  durationMinutes: number; // e.g. 45, 105, 180
  bufferMinutes: number;   // e.g. 10, 15, 20
  priceMad: number;        // e.g. 150, 350, 900
  priceFormatted: string;  // e.g. '150 MAD'
  isChemical: boolean;     // e.g. true for Coloration, Lissage
  description?: string;
}

export interface SlotTimelineCalculation {
  startTime: string;      // e.g. "10:00"
  endTime: string;        // e.g. "11:45"
  bufferEndTime: string;  // e.g. "12:00"
  durationMinutes: number; // e.g. 105
  bufferMinutes: number;   // e.g. 15
  totalReservedMinutes: number; // e.g. 120
  nextFreeSlot: string;   // e.g. "12:00"
}

export interface SlotValidationResult {
  isValid: boolean;
  reason?: 'collision' | 'stylist_off' | 'out_of_hours';
  message: string;
  conflictingAppointment?: Appointment;
  nextAvailableSlot?: string;
}

export interface Appointment {
  id: string;
  stylistId: string;
  client: string;
  clientPhone?: string;
  service: string;
  serviceId?: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  buffer?: string;   // Duration in minutes as string
  bufferEndTime?: string; // HH:mm format
  price: string;
  status: AppointmentStatus;
  date?: string;
  notes?: string;
}

export interface TimelineProps {
  appointments: Appointment[];
  stylist?: Stylist;
}

export interface AppointmentBlockProps {
  appointment: Appointment;
  top: number;
  height: number;
}

