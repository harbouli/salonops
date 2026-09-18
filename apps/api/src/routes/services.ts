import { Router, Request, Response } from 'express';
import { db, services } from '@salonops/database';

export const servicesRouter = Router();

servicesRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const list = await db.select().from(services);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Échec de récupération des prestations', details: err.message });
  }
});
