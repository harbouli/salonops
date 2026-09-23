import { Stylist, Appointment } from '../types/agenda';

export const MOCK_STYLISTS: Stylist[] = [
  { id: '1', name: 'Fatima', role: 'Coloriste Expert', isDayOff: false, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
  { id: '2', name: 'Salma', role: 'Lissage & Soins', isDayOff: false, avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150' },
  { id: '3', name: 'Youssef', role: 'Coupe & Brushing', isDayOff: true, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', stylistId: '1', client: 'Meryem Bennani', service: 'Coloration Racine + Brushing', startTime: '10:00', endTime: '11:45', buffer: '15', price: '350 MAD', status: 'CONFIRMED' },
  { id: 'a2', stylistId: '1', client: 'Kenza Tazi', service: 'Coupe Femme + Brushing', startTime: '12:00', endTime: '12:45', buffer: '10', price: '150 MAD', status: 'IN_CHAIR' },
  { id: 'a3', stylistId: '2', client: 'Samira Idrissi', service: 'Lissage Protéine Caviar', startTime: '14:00', endTime: '17:00', buffer: '20', price: '900 MAD', status: 'CONFIRMED' },
];
