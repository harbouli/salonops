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
  noShowCount: number;
  lateCancellationCount: number;
  reliabilityScore: number;
  reliabilityTier: string;
  depositRecommended: boolean;
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
  totalPaidMad: string;
  changeDueMad: string;
  netSalonRevenueMad: string;
  paymentMethod: PaymentMethod;
  cashAmountMad: string;
  cardAmountMad: string;
  stylistCommissionMad: string;
  createdAt: string;
}

export interface GetCaisseReconciliationDTO {
  branchId: string;
  date?: string;
  openingCashMad?: number | string;
  actualCashMad?: number | string;
}

export interface StylistCaisseBreakdownDTO {
  stylistId: string;
  serviceRevenueMad: string;
  commissionMad: string;
  tipsMad: string;
  transactionCount: number;
}

export interface CaisseReconciliationResponseDTO {
  branchId: string;
  date: string;
  openingCashMad: string;
  totalCashMad: string;
  totalCardMad: string;
  totalPaidMad: string;
  totalServiceRevenueMad: string;
  totalRetailRevenueMad: string;
  totalGrossRevenueMad: string;
  totalTipsMad: string;
  totalCommissionsMad: string;
  netSalonRevenueMad: string;
  transactionCount: number;
  expectedDrawerCashMad: string;
  actualCashMad?: string | null;
  varianceMad?: string | null;
  isBalanced: boolean;
  stylistBreakdowns: StylistCaisseBreakdownDTO[];
}

export type StorageBucket = 'salonops-hair-photos' | 'salonops-receipts';

export interface GenerateUploadUrlDTO {
  fileName: string;
  mimeType: string;
  fileSize?: number;
  bucket?: StorageBucket;
  folder?: string;
}

export interface GenerateUploadUrlResponseDTO {
  uploadUrl: string;
  publicUrl: string;
  bucket: string;
  objectKey: string;
  expiresInSeconds: number;
}
