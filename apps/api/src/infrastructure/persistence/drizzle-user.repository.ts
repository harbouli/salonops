import { db, users, eq } from '@salonops/database';
import { UserRole } from '@salonops/shared-types';
import { IUserRepository } from '../../domain/ports/user-repository.port';
import { User } from '../../domain/models/user.entity';


export class DrizzleUserRepository implements IUserRepository {
  private toDomain(row: typeof users.$inferSelect): User {
    return new User({
      id: row.id,
      branchId: row.branchId,
      fullName: row.fullName,
      phone: row.phone,
      passwordHash: row.passwordHash,
      role: row.role as UserRole,
      avatarUrl: row.avatarUrl,
      commissionPct: row.commissionPct,
      isActive: row.isActive,
      createdAt: row.createdAt ? new Date(row.createdAt) : undefined,
      updatedAt: row.updatedAt ? new Date(row.updatedAt) : undefined,
    });
  }


  public async findByPhone(phone: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  public async findById(id: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  public async save(user: User): Promise<User> {
    const [saved] = await db
      .insert(users)
      .values({
        id: user.id,
        branchId: user.branchId,
        fullName: user.fullName,
        phone: user.phone,
        passwordHash: user.passwordHash,
        role: user.role,
        avatarUrl: user.avatarUrl,
        commissionPct: user.commissionPct,
        isActive: user.isActive,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          fullName: user.fullName,
          phone: user.phone,
          passwordHash: user.passwordHash,
          role: user.role,
          avatarUrl: user.avatarUrl,
          commissionPct: user.commissionPct,
          isActive: user.isActive,
          updatedAt: new Date(),
        },
      })
      .returning();

    return this.toDomain(saved);
  }
}
