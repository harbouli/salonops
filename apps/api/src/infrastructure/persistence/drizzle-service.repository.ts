import { db, services, eq } from '@salonops/database';
import { IServiceRepository } from '../../domain/ports/service-repository.port';
import { Service } from '../../domain/models/service.entity';
import { Money } from '../../domain/value-objects/money.vo';
import { ITenantContextPort } from '../../domain/ports/tenant-context.port';
import { withTenantBranchCondition } from './tenant-scoped-query.decorator';

export class DrizzleServiceRepository implements IServiceRepository {
  constructor(private readonly tenantPort?: ITenantContextPort) {}

  private toDomain(row: typeof services.$inferSelect): Service {
    return new Service({
      id: row.id,
      branchId: row.branchId,
      nameFr: row.nameFr,
      nameAr: row.nameAr,
      category: row.category,
      durationMinutes: row.durationMinutes,
      bufferMinutes: row.bufferMinutes,
      price: Money.fromMad(row.priceMad),
      depositRequired: row.depositRequired,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  public async findById(id: string): Promise<Service | null> {
    const [row] = await db
      .select()
      .from(services)
      .where(eq(services.id, id))
      .limit(1);

    return row ? this.toDomain(row) : null;
  }

  public async findAll(branchId?: string): Promise<Service[]> {
    const branchCondition = withTenantBranchCondition(
      services.branchId,
      branchId,
      this.tenantPort?.getTenant()
    );

    const rows = branchCondition
      ? await db.select().from(services).where(branchCondition)
      : await db.select().from(services);

    return rows.map((r) => this.toDomain(r));
  }
}

