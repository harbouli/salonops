import { AppointmentStatus } from '../../domain/models/appointment.entity';
import { PaymentMethod } from '../../domain/models/transaction.entity';

export interface CreateAppointmentDTO {
  branchId: string;
  stylistId: string;
  clientId: string;
  serviceId: string;
  startTime: string;
  notes?: string;
}

export interface AppointmentResponseDTO {
  id: string;
  branchId: string;
  stylistId: string;
  clientId: string;
  serviceId: string;
  startTime: string;
  endTime: string;
  bufferEndTime: string;
  priceMad: string;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StylistResponseDTO {
  id: string;
  branchId: string;
  fullName: string;
  phone: string;
  role: string;
  avatarUrl?: string | null;
  commissionPct: number;
  isActive: boolean;
  isDayOff: boolean;
  workingStart: string;
  workingEnd: string;
}

export interface ServiceResponseDTO {
  id: string;
  branchId: string;
  nameFr: string;
  nameAr: string;
  category: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceMad: string;
  depositRequired: boolean;
}

export interface ClientResponseDTO {
  id: string;
  branchId: string;
  fullName: string;
  phone: string;
  formattedPhone: string;
  loyaltyPoints: number;
  preferences: string[];
  scalpAlert?: string | null;
  allergies?: string | null;
  createdAt: string;
}

export interface CreateHairFormulaDTO {
  clientId: string;
  stylistId: string;
  appointmentId?: string;
  brand: string;
  shadeFormula: string;
  developerVolume: string;
  processingTimeMinutes: number;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  scalpAlert?: string;
  notes?: string;
}

export interface HairFormulaResponseDTO {
  id: string;
  clientId: string;
  appointmentId?: string | null;
  stylistId: string;
  visitDate: string;
  brand: string;
  shadeFormula: string;
  developerVolume: string;
  processingTimeMinutes: number;
  beforePhotoUrl?: string | null;
  afterPhotoUrl?: string | null;
  scalpAlert?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface ProcessCheckoutDTO {
  branchId: string;
  stylistId: string;
  appointmentId?: string;
  clientId?: string;
  serviceTotalMad: number | string;
  retailTotalMad?: number | string;
  tipAmountMad?: number | string;
  paymentMethod: PaymentMethod;
  cashAmountMad?: number | string;
  cardAmountMad?: number | string;
}

export interface CheckoutResponseDTO {
  id: string;
  branchId: string;
  appointmentId?: string | null;
  stylistId: string;
  clientId?: string | null;
  serviceTotalMad: string;
  retailTotalMad: string;
  tipAmountMad: string;
  grandTotalMad: string;
  paymentMethod: PaymentMethod;
  cashAmountMad: string;
  cardAmountMad: string;
  stylistCommissionMad: string;
  createdAt: string;
}
