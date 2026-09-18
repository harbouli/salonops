import { db, users, eq, and } from '@salonops/database';
import { IStylistRepository } from '../../domain/ports/stylist-repository.port';
import { Stylist } from '../../domain/models/stylist.entity';

export class DrizzleStylistRepository implements IStylistRepository {
  private toDomain(row: typeof users.$inferSelect): Stylist {
    return new Stylist({
      id: row.id,
      branchId: row.branchId,
      fullName: row.fullName,
      phone: row.phone,
      role: row.role,
      avatarUrl: row.avatarUrl,
      commissionPct: row.commissionPct,
      isActive: row.isActive,
      isDayOff: row.isDayOff,
      workingStart: row.workingStart,
      workingEnd: row.workingEnd,
    });
  }

  public async findById(id: string): Promise<Stylist | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  public async findAllActive(branchId?: string): Promise<Stylist[]> {
    const conditions = [eq(users.isActive, true)];
    if (branchId) {
      conditions.push(eq(users.branchId, branchId));
    }

    const rows = await db
      .select()
      .from(users)
      .where(and(...conditions));

    return rows.map((r) => this.toDomain(r));
  }
}
