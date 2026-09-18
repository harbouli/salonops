import { PaymentMethod } from './enums';

export interface CreateAppointmentDTO {
  branchId: string;
  stylistId: string;
  serviceId: string;
  clientName: string;
  clientPhone: string;
  startTime: string;
  notes?: string;
}

export interface CreateFormulaDTO {
  clientId: string;
  appointmentId?: string;
  stylistId: string;
  brand: string;
  shadeFormula: string;
  developerVolume: string;
  processingTimeMinutes: number;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  scalpAlert?: string;
  notes?: string;
}

export interface CheckoutDTO {
  appointmentId: string;
  paymentMethod: PaymentMethod;
  cashAmountMad: number;
  cardAmountMad: number;
  tipAmountMad: number;
  retailTotalMad?: number;
}
