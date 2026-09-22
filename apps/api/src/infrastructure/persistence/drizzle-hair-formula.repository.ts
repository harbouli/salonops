import { db, hairFormulas, eq, desc } from '@salonops/database';
import { IHairFormulaRepository } from '../../domain/ports/hair-formula-repository.port';
import { HairFormula } from '../../domain/models/hair-formula.entity';

export class DrizzleHairFormulaRepository implements IHairFormulaRepository {
  private toDomain(row: typeof hairFormulas.$inferSelect): HairFormula {
    return new HairFormula({
      id: row.id,
      clientId: row.clientId,
      appointmentId: row.appointmentId,
      stylistId: row.stylistId,
      visitDate: row.visitDate,
      brand: row.brand,
      shadeFormula: row.shadeFormula,
      developerVolume: row.developerVolume,
      processingTimeMinutes: row.processingTimeMinutes,
      beforePhotoUrl: row.beforePhotoUrl,
      afterPhotoUrl: row.afterPhotoUrl,
      scalpAlert: row.scalpAlert,
      notes: row.notes,
      createdAt: row.createdAt,
    });
  }

  public async findByClientId(clientId: string): Promise<HairFormula[]> {
    const rows = await db
      .select()
      .from(hairFormulas)
      .where(eq(hairFormulas.clientId, clientId))
      .orderBy(desc(hairFormulas.visitDate));

    return rows.map((r) => this.toDomain(r));
  }

  public async save(formula: HairFormula): Promise<HairFormula> {
    const [inserted] = await db
      .insert(hairFormulas)
      .values({
        id: formula.id,
        clientId: formula.clientId,
        appointmentId: formula.appointmentId,
        stylistId: formula.stylistId,
        visitDate: formula.visitDate,
        brand: formula.brand,
        shadeFormula: formula.shadeFormula,
        developerVolume: formula.developerVolume,
        processingTimeMinutes: formula.processingTimeMinutes,
        beforePhotoUrl: formula.beforePhotoUrl,
        afterPhotoUrl: formula.afterPhotoUrl,
        scalpAlert: formula.scalpAlert,
        notes: formula.notes,
        createdAt: formula.createdAt,
      })
      .returning();

    return this.toDomain(inserted);
  }
}
