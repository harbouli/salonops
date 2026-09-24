import { useState, useEffect } from 'react';
import { Stylist, Appointment, SalonService } from '../types/agenda';

export const SALON_SERVICES: SalonService[] = [
  {
    id: 'srv-coupe-brushing',
    name: 'Coupe + Brushing',
    nameAr: 'قص الشعر وسيشوار',
    category: 'coupe',
    durationMinutes: 45,
    bufferMinutes: 10,
    priceMad: 150,
    priceFormatted: '150 MAD',
    isChemical: false,
    description: 'Coupe structurée et brushing volumateur (45 min + 10 min buffer)',
  },
  {
    id: 'srv-coloration-racine',
    name: 'Coloration Racine',
    nameAr: 'صباغة الجذور وسيشوار',
    category: 'coloration',
    durationMinutes: 105, // 1h45
    bufferMinutes: 15,
    priceMad: 350,
    priceFormatted: '350 MAD',
    isChemical: true,
    description: 'Coloration racine, temps de pose & rinçage soin (1h45 + 15 min buffer)',
  },
  {
    id: 'srv-lissage-proteine',
    name: 'Lissage Protéine',
    nameAr: 'ترطيب الشعر بالبروتين',
    category: 'lissage',
    durationMinutes: 180, // 3h00
    bufferMinutes: 20,
    priceMad: 900,
    priceFormatted: '900 MAD',
    isChemical: true,
    description: 'Soin lissant profond protéine et caviar (3h00 + 20 min buffer)',
  },
];

export const MOCK_STYLISTS: Stylist[] = [
  {
    id: '1',
    name: 'Fatima',
    role: 'Coloriste Expert',
    isDayOff: false,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
  },
  {
    id: '2',
    name: 'Salma',
    role: 'Lissage & Soins',
    isDayOff: false,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
  },
  {
    id: '3',
    name: 'Youssef',
    role: 'Coupe & Brushing',
    isDayOff: true,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'a1',
    stylistId: '1',
    client: 'Meryem Bennani',
    clientPhone: '0661234567',
    service: 'Coloration Racine',
    serviceId: 'srv-coloration-racine',
    startTime: '10:00',
    endTime: '11:45',
    buffer: '15',
    bufferEndTime: '12:00',
    price: '350 MAD',
    status: 'CONFIRMED',
  },
  {
    id: 'a2',
    stylistId: '1',
    client: 'Kenza Tazi',
    clientPhone: '0662345678',
    service: 'Coupe + Brushing',
    serviceId: 'srv-coupe-brushing',
    startTime: '12:00',
    endTime: '12:45',
    buffer: '10',
    bufferEndTime: '12:55',
    price: '150 MAD',
    status: 'IN_CHAIR',
  },
  {
    id: 'a3',
    stylistId: '2',
    client: 'Samira Idrissi',
    clientPhone: '0663456789',
    service: 'Lissage Protéine',
    serviceId: 'srv-lissage-proteine',
    startTime: '14:00',
    endTime: '17:00',
    buffer: '20',
    bufferEndTime: '17:20',
    price: '900 MAD',
    status: 'CONFIRMED',
  },
];

type AppointmentListener = (appointments: Appointment[]) => void;
const listeners = new Set<AppointmentListener>();

export function getAppointments(stylistId?: string): Appointment[] {
  if (!stylistId) {
    return [...MOCK_APPOINTMENTS];
  }
  return MOCK_APPOINTMENTS.filter((apt) => apt.stylistId === stylistId);
}

export function addAppointment(newApt: Omit<Appointment, 'id'> & { id?: string }): Appointment {
  const appointment: Appointment = {
    ...newApt,
    id: newApt.id || `apt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
  };
  MOCK_APPOINTMENTS.push(appointment);
  notifyListeners();
  return appointment;
}

export function subscribeAppointments(listener: AppointmentListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  const current = [...MOCK_APPOINTMENTS];
  listeners.forEach((listener) => {
    try {
      listener(current);
    } catch (e) {
      console.error('Error notifying appointment listener:', e);
    }
  });
}

/**
 * Custom React hook for reactive appointments list
 */
export function useAppointments(stylistId?: string) {
  const [appointments, setAppointments] = useState<Appointment[]>(() => getAppointments(stylistId));

  useEffect(() => {
    // Initial fetch
    setAppointments(getAppointments(stylistId));

    const unsubscribe = subscribeAppointments(() => {
      setAppointments(getAppointments(stylistId));
    });

    return unsubscribe;
  }, [stylistId]);

  return {
    appointments,
    allAppointments: MOCK_APPOINTMENTS,
    addAppointment,
  };
}
