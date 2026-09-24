import { z } from 'zod';

export const createAppointmentSchema = z.object({
  branchId: z.string().uuid({ message: 'branchId doit être un UUID valide' }),
  stylistId: z.string().uuid({ message: 'stylistId doit être un UUID valide' }),
  clientId: z.string().uuid({ message: 'clientId doit être un UUID valide' }),
  serviceId: z.string().uuid({ message: 'serviceId doit être un UUID valide' }),
  startTime: z.string().datetime({ message: 'startTime doit être une date ISO valide' }),
  notes: z.string().optional(),
});

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['BOOKED', 'CONFIRMED', 'IN_CHAIR', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
  reason: z.string().optional(),
  cancellationTime: z.string().datetime().optional(),
  minNoticeHours: z.number().nonnegative().optional(),
  recordedAt: z.string().datetime().optional(),
  gracePeriodMinutes: z.number().nonnegative().optional(),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().optional(),
  cancellationTime: z.string().datetime().optional(),
  minNoticeHours: z.number().nonnegative().optional(),
});

export const markNoShowSchema = z.object({
  recordedAt: z.string().datetime().optional(),
  gracePeriodMinutes: z.number().nonnegative().optional(),
});

export const createHairFormulaSchema = z.object({
  clientId: z.string().uuid(),
  stylistId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  brand: z.string().min(1, 'La marque est obligatoire'),
  shadeFormula: z.string().min(1, 'La formule de nuance est obligatoire'),
  developerVolume: z.string().min(1, "L'oxydant (volume) est obligatoire"),
  processingTimeMinutes: z.number().int().positive('Le temps de pose doit être positif'),
  beforePhotoUrl: z.string().url().optional(),
  afterPhotoUrl: z.string().url().optional(),
  scalpAlert: z.string().optional(),
  notes: z.string().optional(),
});

export const processCheckoutSchema = z.object({
  branchId: z.string().uuid(),
  stylistId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  clientId: z.string().uuid().optional(),
  serviceTotalMad: z.union([z.number(), z.string()]),
  retailTotalMad: z.union([z.number(), z.string()]).optional(),
  tipAmountMad: z.union([z.number(), z.string()]).optional(),
  paymentMethod: z.enum(['CASH', 'TPE_CARD', 'SPLIT']),
  cashAmountMad: z.union([z.number(), z.string()]).optional(),
  cardAmountMad: z.union([z.number(), z.string()]).optional(),
});

export const loginSchema = z.object({
  phone: z.string().min(1, 'Le numéro de téléphone est requis'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export const generatePresignedUrlSchema = z.object({
  fileName: z.string().min(1, 'Le nom du fichier est requis'),
  mimeType: z.string().min(1, 'Le type MIME est requis'),
  fileSize: z.number().int().positive('La taille du fichier doit être un entier positif').optional(),
  bucket: z.enum(['salonops-hair-photos', 'salonops-receipts']).optional(),
  folder: z.string().optional(),
});

export const createWalkInSchema = z.object({
  branchId: z.string().uuid({ message: 'branchId doit être un UUID valide' }),
  phone: z.string().min(1, 'Le numéro de téléphone est requis'),
  fullName: z.string().min(1, 'Le nom complet est requis'),
  serviceId: z.string().uuid({ message: 'serviceId doit être un UUID valide' }),
  price: z.number().positive('Le prix doit être positif'),
  durationMinutes: z.number().int().positive('La durée doit être positive'),
  bufferMinutes: z.number().int().nonnegative().optional(),
});
