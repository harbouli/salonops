import { Router, Request, Response } from 'express';
import { db, clients, hairFormulas, ilike, or, eq, desc } from '@salonops/database';

export const clientsRouter: Router = Router();

clientsRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = String(req.query.q || '').trim();
    if (!q) {
      return res.json([]);
    }

    const list = await db
      .select()
      .from(clients)
      .where(or(ilike(clients.phone, `%${q}%`), ilike(clients.fullName, `%${q}%`)))
      .limit(20);

    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: 'Échec de recherche cliente', details: err.message });
  }
});

clientsRouter.get('/:id/formulas', async (req: Request, res: Response) => {
  try {
    const formulas = await db
      .select()
      .from(hairFormulas)
      .where(eq(hairFormulas.clientId, String(req.params.id)))
      .orderBy(desc(hairFormulas.visitDate));

    res.json(formulas);
  } catch (err: any) {
    res.status(500).json({ error: 'Échec de récupération des formules', details: err.message });
  }
});
