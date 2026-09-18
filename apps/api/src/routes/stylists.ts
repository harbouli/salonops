import { Router, Request, Response } from 'express';
import { db, users, eq } from '@salonops/database';

export const stylistsRouter = Router();

stylistsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const stylists = await db
      .select({
        id: users.id,
        fullName: users.fullName,
        avatarUrl: users.avatarUrl,
        role: users.role,
        isDayOff: users.isDayOff,
        workingStart: users.workingStart,
        workingEnd: users.workingEnd,
      })
      .from(users)
      .where(eq(users.isActive, true));

    res.json(stylists);
  } catch (err: any) {
    res.status(500).json({ error: 'Échec de récupération des coiffeurs', details: err.message });
  }
});
