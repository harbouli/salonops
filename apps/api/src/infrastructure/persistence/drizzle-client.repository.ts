import { db, clients, eq, or, ilike, and, desc } from '@salonops/database';
import { IClientRepository } from '../../domain/ports/client-repository.port';
import { Client } from '../../domain/models/client.entity';
import { MoroccanPhoneNumber } from '../../domain/value-objects/phone-number.vo';

export class DrizzleClientRepository implements IClientRepository {
  private toDomain(row: typeof clients.$inferSelect): Client {
    return new Client({
      id: row.id,
      branchId: row.branchId,
      fullName: row.fullName,
      phone: MoroccanPhoneNumber.create(row.phone),
      loyaltyPoints: row.loyaltyPoints,
      preferences: row.preferences ?? [],
      scalpAlert: row.scalpAlert,
      allergies: row.allergies,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  public async findById(id: string): Promise<Client | null> {
    const [row] = await db
      .select()
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  public async findByPhone(phone: string): Promise<Client | null> {
    const [row] = await db
      .select()
      .from(clients)
      .where(eq(clients.phone, phone))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  public async search(query: string, branchId?: string): Promise<Client[]> {
    const q = query.trim();
    if (!q) {
      return [];
    }

    const conditions = [
      or(ilike(clients.phone, `%${q}%`), ilike(clients.fullName, `%${q}%`)),
    ];

    if (branchId) {
      conditions.push(eq(clients.branchId, branchId));
    }

    const rows = await db
      .select()
      .from(clients)
      .where(and(...conditions))
      .limit(20);

    return rows.map((r) => this.toDomain(r));
  }

  public async save(client: Client): Promise<Client> {
    const [existing] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.id, client.id))
      .limit(1);

    if (existing) {
      const [updated] = await db
        .update(clients)
        .set({
          branchId: client.branchId,
          fullName: client.fullName,
          phone: client.phone.value,
          loyaltyPoints: client.loyaltyPoints,
          preferences: client.preferences,
          scalpAlert: client.scalpAlert,
          allergies: client.allergies,
          updatedAt: client.updatedAt,
        })
        .where(eq(clients.id, client.id))
        .returning();

      return this.toDomain(updated);
    } else {
      const [inserted] = await db
        .insert(clients)
        .values({
          id: client.id,
          branchId: client.branchId,
          fullName: client.fullName,
          phone: client.phone.value,
          loyaltyPoints: client.loyaltyPoints,
          preferences: client.preferences,
          scalpAlert: client.scalpAlert,
          allergies: client.allergies,
          createdAt: client.createdAt,
          updatedAt: client.updatedAt,
        })
        .returning();

      return this.toDomain(inserted);
    }
  }
}
