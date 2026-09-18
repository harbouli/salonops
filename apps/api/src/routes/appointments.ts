import { Router, Request, Response } from 'express';
import { db, appointments, services, eq, and, notInArray, lt, gt, gte, lte } from '@salonops/database';
import { z } from 'zod';

export const appointmentsRouter = Router();

const createAppointmentSchema = z.object({
  branchId: z.string().uuid(),
  stylistId: z.string().uuid(),
  clientId: z.string().uuid(),
  serviceId: z.string().uuid(),
  startTime: z.string().datetime(),
  notes: z.string().optional(),
});

appointmentsRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { stylistId, date } = req.query;
    const conditions = [];

    if (stylistId) {
      conditions.push(eq(appointments.stylistId, String(stylistId)));
    }

    if (date) {
      const dayStart = new Date(String(date));
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(String(date));
      dayEnd.setHours(23, 59, 59, 999);
      conditions.push(gte(appointments.startTime, dayStart));
      conditions.push(lte(appointments.startTime, dayEnd));
    }

    const list = await db
      .select()
      .from(appointments)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Échec de récupération des rendez-vous', details: err.message });
  }
});

appointmentsRouter.post('/', async (req: Request, res: Response) => {
  try {
    const body = createAppointmentSchema.parse(req.body);

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, body.serviceId));

    if (!service) {
      return res.status(404).json({ error: 'Prestation introuvable' });
    }

    const start = new Date(body.startTime);
    const end = new Date(start.getTime() + service.durationMinutes * 60000);
    const bufferEnd = new Date(end.getTime() + service.bufferMinutes * 60000);

    // Concurrency collision check
    const overlapping = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.stylistId, body.stylistId),
          notInArray(appointments.status, ['CANCELLED', 'NO_SHOW']),
          lt(appointments.startTime, bufferEnd),
          gt(appointments.bufferEndTime, start)
        )
      )
      .limit(1);

    if (overlapping.length > 0) {
      return res.status(409).json({
        error: 'Conflit de créneau : la coiffeuse a déjà un rendez-vous ou un temps de pause sur ce créneau.',
      });
    }

    const [appointment] = await db
      .insert(appointments)
      .values({
        branchId: body.branchId,
        stylistId: body.stylistId,
        clientId: body.clientId,
        serviceId: body.serviceId,
        startTime: start,
        endTime: end,
        bufferEndTime: bufferEnd,
        priceMad: service.priceMad,
        notes: body.notes,
      })
      .returning();

    res.status(201).json(appointment);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Données invalides', details: err.errors });
    }
    res.status(500).json({ error: 'Échec de création du rendez-vous', details: err.message });
  }
});
