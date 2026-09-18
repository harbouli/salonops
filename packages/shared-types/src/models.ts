import { UserRole, AppointmentStatus, PaymentMethod } from './enums';

export interface User {
  id: string;
  branchId: string;
  fullName: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  commissionPct: number;
  isActive: boolean;
  createdAt: string;
}

export interface StylistSchedule {
  stylistId: string;
  isDayOff: boolean;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "19:30"
}

export interface Service {
  id: string;
  branchId: string;
  nameFr: string;
  nameAr: string;
  category: 'coupe' | 'brushing' | 'coloration' | 'lissage' | 'soin' | 'autre';
  durationMinutes: number;
  bufferMinutes: number;
  priceMad: number;
  depositRequired: boolean;
  depositThresholdMad?: number;
}

export interface Appointment {
  id: string;
  branchId: string;
  stylistId: string;
  stylistName: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  startTime: string;       // ISO string
  endTime: string;         // ISO string
  bufferEndTime: string;   // ISO string (includes post-service buffer)
  durationMinutes: number;
  bufferMinutes: number;
  priceMad: number;
  status: AppointmentStatus;
  notes?: string;
}

export interface HairFormula {
  id: string;
  clientId: string;
  appointmentId?: string;
  stylistId: string;
  stylistName: string;
  visitDate: string;
  brand: string;
  shadeFormula: string;
  developerVolume: string;
  processingTimeMinutes: number;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  scalpAlert?: string;
  notes?: string;
}

export interface ClientProfile {
  id: string;
  branchId: string;
  fullName: string;
  phone: string;
  totalVisits: number;
  totalSpentMad: number;
  loyaltyPoints: number;
  lastVisitDate?: string;
  preferences: string[];
  scalpSensitivityNotes?: string;
  allergies?: string;
  formulas?: HairFormula[];
}

export interface Transaction {
  id: string;
  branchId: string;
  appointmentId?: string;
  stylistId: string;
  clientId?: string;
  serviceTotalMad: number;
  retailTotalMad: number;
  tipAmountMad: number;
  paymentMethod: PaymentMethod;
  cashAmountMad: number;
  cardAmountMad: number;
  stylistCommissionMad: number;
  createdAt: string;
}
