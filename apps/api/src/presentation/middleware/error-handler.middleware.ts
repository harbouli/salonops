import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import {
  DomainException,
  SlotCollisionException,
  StylistUnavailableException,
  InvalidAppointmentStateException,
  EntityNotFoundException,
  InvalidValueException,
} from '../../domain/exceptions/domain.exception';

export function errorHandlerMiddleware(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod Validation Error
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Données de requête invalides',
      details: err.errors,
    });
    return;
  }

  // Domain Collision
  if (err instanceof SlotCollisionException) {
    res.status(409).json({
      error: 'Conflit de créneau',
      message: err.message,
    });
    return;
  }

  // Stylist Unavailable
  if (err instanceof StylistUnavailableException) {
    res.status(409).json({
      error: 'Coiffeuse indisponible',
      message: err.message,
    });
    return;
  }

  // Entity Not Found
  if (err instanceof EntityNotFoundException) {
    res.status(404).json({
      error: 'Ressource introuvable',
      message: err.message,
    });
    return;
  }

  // State Transition Error
  if (err instanceof InvalidAppointmentStateException) {
    res.status(422).json({
      error: 'Transition de statut invalide',
      message: err.message,
    });
    return;
  }

  // Invalid Value (e.g. money, phone)
  if (err instanceof InvalidValueException) {
    res.status(400).json({
      error: 'Valeur invalide',
      message: err.message,
    });
    return;
  }

  // Generic Domain Error
  if (err instanceof DomainException) {
    res.status(400).json({
      error: 'Erreur métier',
      message: err.message,
    });
    return;
  }

  // Catch-all
  console.error('[API Error]', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    message: process.env.NODE_ENV === 'development' ? err?.message : undefined,
  });
}
