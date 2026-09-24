export type AppointmentStatus = 'CONFIRMED' | 'IN_CHAIR' | 'COMPLETED' | 'CANCELLED';

export interface Stylist {
  id: string;
  name: string;
  role: string;
  isDayOff: boolean;
  avatar: string;
}

export interface Appointment {
  id: string;
  stylistId: string;
  client: string;
  service: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  buffer?: string;   // Duration in minutes as string
  price: string;
  status: AppointmentStatus;
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
